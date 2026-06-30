const Order = require('../models/Order');
const { createInvoicePDF } = require('../utils/invoiceGenerator');
const { generateBarcodeBuffer, generateQrCodeBuffer } = require('../utils/barcodeUtils');

exports.getInvoice = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    console.log(`[INVOICE] user=${req.user._id} requesting invoice for order=${order._id}`);

    const pdfBuffer = await createInvoicePDF(order, {
      logoPath: process.env.INVOICE_LOGO_PATH,
      companyName: process.env.COMPANY_NAME || 'Manisara World Pvt Ltd',
      companyAddress: process.env.COMPANY_ADDRESS || '123 Fashion Street, Mumbai',
      footerMessage: process.env.INVOICE_FOOTER || 'Thank you for shopping with Manisara World!'
    });

    const inline = req.query.inline === 'true';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename=invoice_${order.orderNumber}.pdf`);
    res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBarcode = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const type = req.query.type || 'tracking';
    const values = {
      order: order.orderNumber,
      tracking: order.courierDetails?.trackingId || order.courierDetails?.awbNumber || order.orderNumber,
      courier: order.courierDetails?.awbNumber || order.courierDetails?.trackingId || order.orderNumber,
      package: order.packageId || order.orderNumber,
      qr: JSON.stringify({
        orderNumber: order.orderNumber,
        invoiceNumber: order.invoiceNumber,
        packageId: order.packageId,
        trackingId: order.courierDetails?.trackingId,
        awbNumber: order.courierDetails?.awbNumber
      })
    };
    const tracking = values[type] || values.tracking;
    console.log(`[BARCODE] user=${req.user._id} requesting barcode for order=${order._id} tracking=${tracking}`);
    try {
      const png = type === 'qr'
        ? await generateQrCodeBuffer(tracking)
        : await generateBarcodeBuffer(tracking, { includetext: true });
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename=${type}_${order.orderNumber}.png`);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      return res.send(png);
    } catch (genErr) {
      console.error('[BARCODE][ERR] generateBarcodeBuffer error', genErr);
      return res.status(500).json({ success: false, message: 'Failed to generate barcode' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
