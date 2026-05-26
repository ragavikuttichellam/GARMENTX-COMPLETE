const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/garment')
  .then(async () => {
    const email = process.argv[2] || 'admin@garmentx.com';
    const password = process.argv[3] || 'admin123';
    let user = await User.findOne({ email });
    if (user) {
      user.role = 'admin';
      user.isActive = true;
      await user.save();
      console.log('Updated existing user to admin:', email);
    } else {
      user = await User.create({ name: 'Admin', email, password, role: 'admin' });
      console.log('Created admin user:', email);
    }
    process.exit(0);
  })
  .catch(err => { console.error(err); process.exit(1); });
