const mongoose = require('mongoose');

/**
 * Production-ready MongoDB connection module with comprehensive error handling
 * Features:
 * - Automatic retry with exponential backoff
 * - Connection pooling optimized for eCommerce
 * - Detailed error diagnostics
 * - Connection status monitoring
 * 
 * Usage:
 *   const mongoConnection = require('./utils/database');
 *   await mongoConnection.connect(process.env.MONGO_URI);
 */

class MongoDBConnection {
  constructor() {
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 3;
  }

  async connect(uri = process.env.MONGO_URI) {
    if (!uri) {
      throw new Error(
        '❌ MongoDB URI not provided.\n' +
        '   Set MONGO_URI in .env file:\n' +
        '   MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/database'
      );
    }

    if (this.isConnected) {
      console.log('ℹ️  MongoDB already connected');
      return mongoose;
    }

    try {
      this.connectionAttempts++;
      console.log(`\n🔄 MongoDB Connection Attempt ${this.connectionAttempts}/${this.maxRetries + 1}`);
      console.log(`   Cluster: ${uri.split('@')[1]?.split('.')[0] || 'Unknown'}`);

      const connection = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        maxPoolSize: 10,
        minPoolSize: 5,
        maxIdleTimeMS: 45000,
        appName: 'garmentx-ecommerce',
        authSource: 'admin',
        family: 4, // Use IPv4, skip IPv6
        directConnection: false, // Allow SRV records
      });

      this.isConnected = true;
      console.log('✅  MongoDB Connected Successfully');
      console.log(`   Host: ${connection.connection.host}`);
      console.log(`   Port: ${connection.connection.port}`);
      console.log(`   Database: ${connection.connection.db.getName()}`);
      console.log(`   Pool Size: ${connection.connection.getClient()?.topology?.s?.pool?.poolSize || 'N/A'}`);

      return connection;

    } catch (error) {
      console.error(`\n❌ MongoDB Connection Failed (Attempt ${this.connectionAttempts})`);
      console.error(`   Error: ${error.message}`);
      console.error(`   Code: ${error.code || 'N/A'}`);

      // Detailed error diagnostics
      this.diagnoseError(error, uri);

      // Retry logic with exponential backoff
      if (this.connectionAttempts < this.maxRetries + 1) {
        const delay = Math.pow(2, this.connectionAttempts - 1) * 1000; // Exponential backoff
        console.log(`\n⏳ Retrying in ${delay / 1000}s...\n`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.connect(uri);
      }

      throw new Error(
        `Failed to connect to MongoDB after ${this.maxRetries + 1} attempts:\n` +
        `${error.message}`
      );
    }
  }

  diagnoseError(error, uri) {
    const message = error.message.toLowerCase();

    if (message.includes('econnrefused') || message.includes('querysrv')) {
      console.error('\n   💡 Diagnosis: DNS/Network connectivity issue');
      console.error('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('   Root Causes:');
      console.error('   1. Your IP address not in MongoDB Atlas IP whitelist');
      console.error('   2. Connection string syntax error');
      console.error('   3. <db_password> placeholder not replaced with actual password');
      console.error('   4. Firewall/Antivirus blocking port 27017');
      console.error('   5. Windows DNS cache corrupted');
      console.error('   6. ISP blocking MongoDB connection');
      console.error('');
      console.error('   Fixes to try:');
      console.error('   1. Add your IP to Atlas Network Access:');
      console.error('      → https://cloud.mongodb.com → Network Access');
      console.error('      → Find IP: https://whatismyipaddress.com/');
      console.error('   2. Verify connection string format (no <db_password> placeholder)');
      console.error('   3. Flush Windows DNS cache:');
      console.error('      → ipconfig /flushdns');
      console.error('   4. Test connectivity:');
      console.error('      → Test-NetConnection -ComputerName cluster0.yvpbgqi.mongodb.net -Port 27017');
      console.error('   5. Test DNS SRV resolution:');
      console.error('      → nslookup -type=SRV _mongodb._tcp.cluster0.yvpbgqi.mongodb.net');
    }

    else if (message.includes('authentication failed') || message.includes('invalid credentials')) {
      console.error('\n   💡 Diagnosis: Authentication/Credentials issue');
      console.error('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('   Fixes to try:');
      console.error('   1. Verify username in MongoDB Atlas Database Access:');
      console.error('      → https://cloud.mongodb.com → Database Access');
      console.error('   2. Verify password (case-sensitive):');
      console.error('      → Check for special characters that need URL encoding');
      console.error('      → @ → %40, ! → %21, # → %23, $ → %24, etc.');
      console.error('   3. Regenerate password:');
      console.error('      → Database Access → Select User → Edit Password');
      console.error('   4. Check authSource parameter (should be "admin")');
    }

    else if (message.includes('timed out') || message.includes('timeout')) {
      console.error('\n   💡 Diagnosis: Connection timeout');
      console.error('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('   Fixes to try:');
      console.error('   1. Check IP whitelist in Atlas Network Access:');
      console.error('      → Ensure your IP is whitelisted');
      console.error('   2. Verify cluster status:');
      console.error('      → Cluster not paused or in maintenance');
      console.error('   3. Slow network connection?');
      console.error('      → Increase serverSelectionTimeoutMS value');
      console.error('   4. Check firewall rules allowing outbound connections');
    }

    else if (message.includes('authorization failed')) {
      console.error('\n   💡 Diagnosis: User authorization issue');
      console.error('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('   Fixes to try:');
      console.error('   1. Verify user has correct roles:');
      console.error('      → https://cloud.mongodb.com → Database Access');
      console.error('      → User should have "Read/Write to any database" or specific database role');
      console.error('   2. Verify authSource is set to "admin":');
      console.error('      → ?authSource=admin in connection string');
    }

    else if (message.includes('no scheme')) {
      console.error('\n   💡 Diagnosis: Invalid connection string format');
      console.error('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('   Correct format examples:');
      console.error('   mongodb+srv://user:password@cluster.mongodb.net/database');
      console.error('   Make sure it starts with "mongodb+srv://" (not "mongodb://")');
    }
  }

  async disconnect() {
    if (this.isConnected) {
      try {
        await mongoose.disconnect();
        this.isConnected = false;
        console.log('✅  MongoDB Disconnected');
      } catch (error) {
        console.error('❌ Error disconnecting from MongoDB:', error.message);
      }
    }
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState, // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
      host: mongoose.connection.host || 'unknown',
      port: mongoose.connection.port || 'unknown',
      database: mongoose.connection.db?.getName() || 'unknown',
      readyStateDescription: this.getReadyStateDescription(mongoose.connection.readyState),
    };
  }

  getReadyStateDescription(readyState) {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[readyState] || 'unknown';
  }
}

module.exports = new MongoDBConnection();
