const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();
const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!uri) {
  console.error('Missing MONGODB_URI or MONGO_URI in environment.');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(uri);
    const user = await User.findOne({ email: 'test+1780672899745@example.com' }).lean();
    console.log(JSON.stringify(user, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
