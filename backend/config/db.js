const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const databaseUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!databaseUri) {
      throw new Error(
        'MONGODB_URI or MONGO_URI environment variable is required.\n' +
        'Format: mongodb+srv://user:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority'
      );
    }

    // Validate URI format
    if (!databaseUri.includes('@')) {
      throw new Error('Invalid MongoDB URI: missing credentials. Format must be mongodb+srv://user:pass@cluster...');
    }

    if (!databaseUri.includes('.mongodb.net')) {
      throw new Error('Invalid MongoDB URI: not an Atlas cluster. Must end with .mongodb.net');
    }

    if (databaseUri.includes('<db_password>')) {
      throw new Error('Invalid MongoDB URI: <db_password> placeholder not replaced. Use actual password in .env file.');
    }

    console.log('🔌 Attempting MongoDB connection...');
    const maskedUri = databaseUri.replace(/:[^@]*@/, ':****@');
    console.log(`   URI: ${maskedUri}`);

    const conn = await mongoose.connect(databaseUri, {
      serverSelectionTimeoutMS: 10000,       // Increased for Atlas
      socketTimeoutMS: 45000,                // Prevent timeout on large queries
      retryWrites: true,
      maxPoolSize: 10,
      minPoolSize: 5,
      appName: 'garmentx-app',
      authSource: 'admin',                   // Explicitly set auth database
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4,                             // Use IPv4, skip IPv6
    });

    console.log(`✅  MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`);
    console.log(`   Database: ${conn.connection.db.getName()}`);
    return conn;

  } catch (error) {
    console.error('❌  MongoDB Connection Error:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.error('\n   Diagnosis: DNS/Network issue');
      console.error('   Fixes to try:');
      console.error('   1. Add your IP to MongoDB Atlas Network Access (Settings → Network Access)');
      console.error('   2. Verify connection string format (no <db_password> placeholder)');
      console.error('   3. Flush DNS cache: ipconfig /flushdns');
      console.error('   4. Check firewall/antivirus blocking port 27017');
    } else if (error.message.includes('authentication failed')) {
      console.error('\n   Diagnosis: Invalid credentials');
      console.error('   Fixes to try:');
      console.error('   1. Verify username and password in MongoDB Atlas Database Access');
      console.error('   2. URL-encode special characters in password (e.g., @="%40")');
      console.error('   3. Regenerate password in Database Access settings');
    } else if (error.message.includes('timeout')) {
      console.error('\n   Diagnosis: Connection timeout');
      console.error('   Fixes to try:');
      console.error('   1. Check Network Access whitelist includes your IP');
      console.error('   2. Verify cluster is not paused');
      console.error('   3. Increase serverSelectionTimeoutMS if on slow network');
    }

    process.exit(1);
  }
};

module.exports = connectDB;
