const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required. Refusing to create a test order without an explicit database connection string.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ email: 'admin@manisaraworld.com' }) || await User.findOne();
  const product = await Product.findOne();
  if (!user || !product) {
    console.error('Need at least one user and one product seeded. Run seedData.js first.');
    process.exit(1);
  }

  const order = await Order.create({
    user: user._id,
    orderItems: [{ product: product._id, name: product.name, image: product.images?.[0], price: product.price, quantity: 1 }],
    shippingAddress: { fullName: user.name || 'Test User', phone: '9999999999', street: '1 Test Lane', city: 'Mumbai', state: 'MH', pincode: '400001', country: 'India' },
    paymentMethod: 'test',
    paymentResult: { status: 'success' },
    itemsPrice: product.price,
    gstAmount: Math.round(product.price * 0.18),
    deliveryCharges: 0,
    totalPrice: product.price + Math.round(product.price*0.18),
    isPaid: true,
    status: 'processing',
    trackingId: 'TESTTRACK' + Date.now()
  });

  console.log('Created test order:', order._id.toString());
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
