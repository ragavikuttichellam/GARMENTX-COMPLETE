const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
});

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const options = {
      amount: Math.round(order.totalPrice * 100), // paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: { orderId: order._id.toString(), userId: req.user._id.toString() }
    };

    const razorpayOrder = await razorpay.orders.create(options);
    res.json({ success: true, razorpayOrder, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Payment initialization failed: ' + err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
      .update(body).digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const order = await Order.findByIdAndUpdate(orderId, {
      isPaid: true,
      paidAt: Date.now(),
      status: 'confirmed',
      paymentResult: { razorpay_order_id, razorpay_payment_id, razorpay_signature, status: 'paid' }
    }, { new: true });

    res.json({ success: true, message: '🎉 Payment verified! Order confirmed.', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getKey = (req, res) => {
  res.json({ success: true, key: process.env.RAZORPAY_KEY_ID });
};
