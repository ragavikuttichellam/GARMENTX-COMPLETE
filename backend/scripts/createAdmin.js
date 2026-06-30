const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/User');

// Accept either MONGODB_URI or the legacy MONGO_URI from .env
const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!dbUri) {
  console.error('MONGODB_URI or MONGO_URI is required. Refusing to create an admin without an explicit database connection string.');
  process.exit(1);
}

mongoose.connect(dbUri)
  .then(async () => {
    const email = process.argv[2] || 'admin@manisaraworld.com';
    const password = process.argv[3];
    let user = await User.findOne({ email });
    if (user) {
      user.role = 'admin';
      user.isActive = true;
      if (password) {
        user.password = password;
      }
      await user.save();
      console.log(`Updated existing user to admin: ${email}` + (password ? ' and reset password.' : ''));
    } else {
      user = await User.create({ name: 'Admin', email, password: password || 'admin123', role: 'admin' });
      console.log('Created admin user:', email);
      if (!process.argv[3]) {
        console.log('Warning: using fallback default password admin123. Pass a password as the second argument to set a secure value.');
      }
    }
    process.exit(0);
  })
  .catch(err => { console.error(err); process.exit(1); });
