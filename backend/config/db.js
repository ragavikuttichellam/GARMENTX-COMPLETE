const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/garmentx', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅  MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌  Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
