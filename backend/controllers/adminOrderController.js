const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { getOrderScanCodes } = require('../utils/barcodeUtils');
const { createShippingLabelPDF } = require('../utils/shippingLabelGenerator');

const STATUS_FROM_SCAN_ACTION = {
  packed: { status: 'packed', shippingStatus: 'packed' },
  shipped: { status: 'shipped', shippingStatus: 'shipped' },
  out_for_delivery: { status: 'out_for_delivery', shippingStatus: 'out_for_delivery' },
  delivered: { status: 'delivered', shippingStatus: 'delivered', isDelivered: true }
};

function normalizeScannedCodes(rawCode) {
  const codes = new Set([String(rawCode).trim()]);

  try {
    const parsed = JSON.parse(rawCode);
    [
      parsed.orderNumber,
      parsed.invoiceNumber,
      parsed.packageId,
      parsed.tracking,
      parsed.trackingId,
      parsed.awbNumber
    ].filter(Boolean).forEach((value) => codes.add(String(value).trim()));
  } catch (err) {
    // Plain Code128 values are expected here.
  }

  return [...codes].filter(Boolean);
}

/**
 * Get comprehensive admin dashboard statistics
 * Includes revenue analytics, order metrics, and performance indicators
 */
exports.getAdminStats = async (req, res) => {
  try {
    const [totalProducts, totalOrders, totalUsers, paidOrders, pendingOrders, shippedOrders, deliveredOrders, returnedOrders] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Order.find({ isPaid: true }).select('totalPrice createdAt'),
      Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'processing', 'packed'] } }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'returned' })
    ]);

    // Calculate revenue metrics
    const totalRevenue = paidOrders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
    const revenueByDay = paidOrders.reduce((acc, order) => {
      const key = order.createdAt.toISOString().slice(0, 10);
      acc[key] = (acc[key] || 0) + (order.totalPrice || 0);
      return acc;
    }, {});

    // Get last 30 days revenue trend
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRevenue = paidOrders
      .filter(o => o.createdAt >= thirtyDaysAgo)
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    // Calculate fulfillment rate
    const deliveryRate = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      stats: {
        overview: {
          totalProducts,
          totalOrders,
          totalUsers,
          totalRevenue: Number(totalRevenue.toFixed(2)),
          recentRevenue: Number(recentRevenue.toFixed(2))
        },
        orders: {
          pending: pendingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          returned: returnedOrders,
          fulfillmentRate: Number(deliveryRate)
        },
        analytics: {
          revenueByDay,
          averageOrderValue: totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get all orders with optional filtering and pagination
 */
exports.getAdminOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: new RegExp(search, 'i') },
        { invoiceNumber: new RegExp(search, 'i') },
        { packageId: new RegExp(search, 'i') },
        { 'shippingAddress.fullName': new RegExp(search, 'i') },
        { 'courierDetails.awbNumber': new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name images image price');

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get detailed order information by ID
 */
exports.getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('orderItems.product');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Scan order barcode/QR code and update status
 * Supports multiple scan types: packed, shipped, out_for_delivery, delivered
 */
exports.scanOrder = async (req, res) => {
  try {
    const { code, action = 'verified', note } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Scan code is required' });

    const scannedCodes = normalizeScannedCodes(String(code));
    const orders = await Order.find({}).populate('user', 'name email phone');
    const order = orders.find((candidate) => {
      const orderCodes = getOrderScanCodes(candidate);
      return scannedCodes.some((scannedCode) => orderCodes.includes(scannedCode));
    });
    if (!order) return res.status(404).json({ success: false, message: 'No order found for scanned code' });

    const update = STATUS_FROM_SCAN_ACTION[action] || {};
    Object.assign(order, update);
    
    if (action === 'delivered') {
      order.deliveredAt = new Date();
      order.isDelivered = true;
    }
    
    if (action === 'shipped' && !order.courierDetails?.shippedAt) {
      order.courierDetails = { ...(order.courierDetails || {}), shippedAt: new Date() };
    }
    
    order.scanHistory.push({
      action,
      scannedCode: code,
      scannedBy: req.user._id,
      scannedAt: new Date(),
      note
    });
    
    await order.save();

    res.json({ success: true, message: 'Scan processed successfully', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get scan history for a specific order
 */
exports.getOrderScanHistory = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .select('orderNumber scanHistory')
      .populate('scanHistory.scannedBy', 'name email');
    
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    res.json({
      success: true,
      orderNumber: order.orderNumber,
      scanHistory: order.scanHistory || []
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Generate shipping label PDF for an order
 */
exports.getShippingLabel = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const pdfBuffer = await createShippingLabelPDF(order, {
      companyName: process.env.COMPANY_NAME || 'GarmentX'
    });

    const inline = req.query.inline === 'true';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename=shipping_label_${order.orderNumber}.pdf`);
    res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Bulk update order status for multiple orders
 * Useful for batch operations like marking multiple orders as packed
 */
exports.bulkUpdateOrderStatus = async (req, res) => {
  try {
    const { orderIds, status, note } = req.body;
    
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Order IDs array is required' });
    }
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const updates = {};
    updates.status = status;
    
    if (status === 'delivered') {
      updates.isDelivered = true;
      updates.deliveredAt = new Date();
    }

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      {
        $set: updates,
        $push: {
          scanHistory: {
            action: status,
            scannedBy: req.user._id,
            scannedAt: new Date(),
            note: note || `Bulk updated by admin`
          }
        }
      }
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} orders`,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update courier/tracking information for an order
 */
exports.updateCourierDetails = async (req, res) => {
  try {
    const { provider, service, trackingId, awbNumber, trackingUrl } = req.body;
    
    if (!req.params.id) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          'courierDetails.provider': provider,
          'courierDetails.service': service,
          'courierDetails.trackingId': trackingId,
          'courierDetails.awbNumber': awbNumber,
          'courierDetails.trackingUrl': trackingUrl,
          'courierDetails.updatedAt': new Date()
        }
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, message: 'Courier details updated', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get orders awaiting specific actions (packing, shipping, etc.)
 */
exports.getOrdersByStatus = async (req, res) => {
  try {
    const { statuses } = req.query;
    
    const statusList = statuses 
      ? statuses.split(',').map(s => s.trim())
      : ['pending', 'confirmed', 'processing'];

    const orders = await Order.find({ status: { $in: statusList } })
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name image');

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
