const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/User');

const email = process.argv[2];
if (!email) {
  console.error('Usage: node promoteUserDirect.js <email>');
  process.exit(1);
}

(async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.error('MONGODB_URI or MONGO_URI must be set in environment or .env');
      process.exit(1);
    }
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      console.error('User not found:', email);
      process.exit(1);
    }
    console.log('Before role:', user.role);
    user.role = 'admin';
    user.isActive = true;
    await user.save();
    const updated = await User.findOne({ email: email.toLowerCase() });
    console.log('After role:', updated.role);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
