const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;
    if (!orderItems || orderItems.length === 0) return res.status(400).json({ success: false, message: 'No order items' });

    // Verify products & calculate price
    let itemsPrice = 0;
    const verifiedItems = [];
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      if (product.stock < item.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      verifiedItems.push({ product: product._id, name: product.name, image: product.images[0] || '', price: product.price, quantity: item.quantity, size: item.size, color: item.color });
      itemsPrice += product.price * item.quantity;
    }

    const gstAmount = parseFloat((itemsPrice * 0.18).toFixed(2));
    const deliveryCharges = itemsPrice > 999 ? 0 : 99;
    const totalPrice = parseFloat((itemsPrice + gstAmount + deliveryCharges).toFixed(2));

    const order = await Order.create({ user: req.user._id, orderItems: verifiedItems, shippingAddress, paymentMethod: paymentMethod || 'razorpay', itemsPrice, gstAmount, deliveryCharges, totalPrice });

    // Reduce stock
    for (const item of verifiedItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    res.status(201).json({ success: true, message: 'Order created!', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('orderItems.product', 'name images');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate('orderItems.product');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate('user', 'name email').populate('orderItems.product', 'name');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status, ...(status === 'delivered' && { isDelivered: true, deliveredAt: Date.now() }) }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order status updated!', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
