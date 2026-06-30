#!/usr/bin/env node

/**
 * MongoDB Atlas Connection Diagnostic Tool
 * 
 * This script diagnoses and tests MongoDB Atlas connectivity issues
 * 
 * Usage:
 *   node scripts/diagnoseMongoConnection.js
 * 
 * What it checks:
 * 1. Environment configuration (.env file)
 * 2. Connection string format validation
 * 3. DNS resolution (A records and SRV records)
 * 4. MongoDB Atlas connectivity
 * 5. Database access and collections
 * 6. Detailed error diagnostics
 */

const dns = require('dns').promises;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const symbols = {
  success: '✅',
  error: '❌',
  warning: '⚠️ ',
  info: 'ℹ️ ',
  arrow: '→',
  check: '✓',
  cross: '✗',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log(`\n${colors.bright}${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${title.padEnd(61)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}\n`);
}

function subsection(title) {
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.cyan}${'-'.repeat(60)}${colors.reset}`);
}

async function diagnose() {
  section('MongoDB Atlas Connection Diagnostic Tool');

  // Step 1: Environment Check
  subsection('1️⃣  Environment Configuration Check');
  
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  
  if (!mongoUri) {
    log(`${symbols.error} MONGO_URI not found in .env file`, 'red');
    log(`${symbols.arrow} Create .env file with: MONGO_URI=mongodb+srv://...`, 'yellow');
    process.exit(1);
  }

  log(`${symbols.success} MONGO_URI found`, 'green');

  // Validate URI format
  const uriMatch = mongoUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)(\/[^?]*)?/);
  if (!uriMatch) {
    log(`${symbols.error} Invalid MongoDB URI format`, 'red');
    log(`   Expected: mongodb+srv://user:password@cluster.mongodb.net/database`, 'yellow');
    log(`   Got: ${mongoUri.substring(0, 80)}...`, 'yellow');
    process.exit(1);
  }

  const [, username, password, clusterDomain, database] = uriMatch;
  
  log(`${symbols.success} Connection string format: Valid`, 'green');
  log(`   Username: ${username}`, 'cyan');
  log(`   Cluster: ${clusterDomain}`, 'cyan');
  log(`   Database: ${database || '(not specified)'} ← Consider adding /garmentx`, 'cyan');
  log(`   Password: ${password.substring(0, 3)}${'*'.repeat(Math.max(0, password.length - 3))}`, 'cyan');

  // Check for placeholder password
  if (mongoUri.includes('<db_password>') || mongoUri.includes('<password>')) {
    log(`${symbols.error} Connection string still has <db_password> placeholder!`, 'red');
    log(`${symbols.arrow} Replace with actual password in .env file`, 'yellow');
    process.exit(1);
  }

  // Step 2: DNS Resolution Check
  subsection('2️⃣  DNS Resolution Test');

  // A Record resolution
  try {
    const addresses = await dns.resolve4(clusterDomain);
    log(`${symbols.success} DNS A Record: Resolved`, 'green');
    addresses.forEach((ip, i) => {
      log(`   [${i + 1}] ${ip}`, 'cyan');
    });
  } catch (error) {
    log(`${symbols.error} DNS A Record lookup failed: ${error.message}`, 'red');
    log(`${symbols.warning} This prevents direct connection to cluster`, 'yellow');
  }

  // SRV Record resolution (crucial for MongoDB SRV connection)
  try {
    const srvRecords = await dns.resolveSrv(`_mongodb._tcp.${clusterDomain}`);
    log(`${symbols.success} SRV Records: Found ${srvRecords.length} record(s)`, 'green');
    srvRecords.forEach((record, i) => {
      log(`   [${i + 1}] ${record.name}:${record.port} (priority: ${record.priority}, weight: ${record.weight})`, 'cyan');
    });
  } catch (error) {
    log(`${symbols.error} SRV Record lookup failed: ${error.message}`, 'red');
    log(`${symbols.warning} This is the root cause of querySrv ECONNREFUSED error!`, 'yellow');
    log(`${symbols.arrow} Likely causes:`, 'yellow');
    log(`   1. Your IP not in MongoDB Atlas Network Access whitelist`, 'yellow');
    log(`   2. Connection string format error or typo in cluster domain`, 'yellow');
    log(`   3. Windows DNS cache issue: Run 'ipconfig /flushdns'`, 'yellow');
    log(`   4. Firewall/Antivirus blocking DNS port 53 or MongoDB port 27017`, 'yellow');
    log(`   5. ISP blocking MongoDB connections`, 'yellow');
  }

  // Step 3: Network Connectivity Check
  subsection('3️⃣  Network Connectivity Test');

  try {
    const { execSync } = require('child_process');
    const testCmd = `Test-NetConnection -ComputerName ${clusterDomain} -Port 27017 -InformationLevel "Quiet" 2>&1`;
    const result = execSync(testCmd, { encoding: 'utf8' }).trim();
    
    if (result.includes('True') || result.includes('SUCCESS')) {
      log(`${symbols.success} Network connectivity: OK (Port 27017 accessible)`, 'green');
    } else {
      log(`${symbols.error} Network connectivity: Failed`, 'red');
      log(`${symbols.arrow} Port 27017 not accessible from your network`, 'yellow');
    }
  } catch (error) {
    log(`${symbols.warning} Could not test network connectivity`, 'yellow');
    log(`${symbols.arrow} Use: Test-NetConnection -ComputerName ${clusterDomain} -Port 27017`, 'cyan');
  }

  // Step 4: MongoDB Connection Test
  subsection('4️⃣  MongoDB Atlas Connection Test');

  try {
    console.log('Attempting MongoDB connection...');
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 5000,
    });

    log(`${symbols.success} MongoDB Connected Successfully!`, 'green');
    log(`   Host: ${connection.connection.host}`, 'cyan');
    log(`   Port: ${connection.connection.port}`, 'cyan');
    log(`   Database: ${connection.connection.db.getName()}`, 'cyan');

    // Test database operations
    try {
      const collections = await connection.connection.db.listCollections().toArray();
      log(`${symbols.success} Database Collections: ${collections.length}`, 'green');
      if (collections.length > 0) {
        collections.forEach(col => {
          log(`   ${symbols.check} ${col.name}`, 'cyan');
        });
      }
    } catch (collError) {
      log(`${symbols.warning} Could not list collections: ${collError.message}`, 'yellow');
    }

    // Test write/read capability
    try {
      const testDb = connection.connection.db.db('garmentx');
      const testCollection = testDb.collection('_connection_test');
      
      const testDoc = { test: true, timestamp: new Date() };
      const insertResult = await testCollection.insertOne(testDoc);
      await testCollection.deleteOne({ _id: insertResult.insertedId });
      
      log(`${symbols.success} Read/Write Test: Passed (test document created and deleted)`, 'green');
    } catch (rwError) {
      log(`${symbols.warning} Read/Write Test: ${rwError.message}`, 'yellow');
    }

    await mongoose.disconnect();

  } catch (error) {
    log(`${symbols.error} MongoDB Connection Failed: ${error.message}`, 'red');
    log(`   Error Code: ${error.code || 'N/A'}`, 'yellow');
    
    const message = error.message.toLowerCase();

    if (message.includes('querysrv') || message.includes('econnrefused')) {
      log(`\n${symbols.error} Root Cause: DNS/Network Issue (querySrv ECONNREFUSED)`, 'red');
      log(`\n${symbols.arrow} Likely causes:`, 'yellow');
      log(`   1. Your public IP not added to MongoDB Atlas Network Access`, 'yellow');
      log(`   2. Firewall/Antivirus blocking port 27017`, 'yellow');
      log(`   3. ISP blocking MongoDB connections`, 'yellow');
      log(`   4. Windows DNS cache corrupted`, 'yellow');
      log(`   5. Connection string typo (cluster domain)`, 'yellow');
      log(`\n${symbols.arrow} Quick fixes to try:`, 'yellow');
      log(`   1. Find your IP: https://whatismyipaddress.com/`, 'cyan');
      log(`   2. Add to Atlas: https://cloud.mongodb.com → Network Access → Add IP`, 'cyan');
      log(`   3. Flush DNS: ipconfig /flushdns`, 'cyan');
      log(`   4. Test SRV: nslookup -type=SRV _mongodb._tcp.${clusterDomain}`, 'cyan');
      log(`   5. Wait 5 minutes for Atlas IP whitelist to propagate`, 'cyan');
    }

    else if (message.includes('authentication failed') || message.includes('invalid credentials')) {
      log(`\n${symbols.error} Root Cause: Authentication Failed`, 'red');
      log(`\n${symbols.arrow} Fixes to try:`, 'yellow');
      log(`   1. Verify username exists in Database Access (Atlas console)`, 'cyan');
      log(`   2. Check password is correct (case-sensitive)`, 'cyan');
      log(`   3. If password has special chars (@, !, #), URL-encode them`, 'cyan');
      log(`   4. Regenerate password in Database Access → Edit User → Edit Password`, 'cyan');
      log(`   5. Ensure user has correct roles (at least readWrite for garmentx db)`, 'cyan');
    }

    else if (message.includes('timeout')) {
      log(`\n${symbols.error} Root Cause: Connection Timeout`, 'red');
      log(`\n${symbols.arrow} Fixes to try:`, 'yellow');
      log(`   1. Check IP is in MongoDB Atlas Network Access whitelist`, 'cyan');
      log(`   2. Verify cluster is not paused`, 'cyan');
      log(`   3. Check firewall allows outbound connections`, 'cyan');
      log(`   4. Try increasing serverSelectionTimeoutMS`, 'cyan');
    }
  }

  // Step 5: Summary
  section('📋 Diagnostic Summary & Next Steps');

  log(`${symbols.info} If all tests passed:`, 'green');
  log(`   Your MongoDB Atlas connection is working correctly!`, 'green');
  log(`   ${symbols.arrow} Update your .env file with the connection string`, 'cyan');
  log(`   ${symbols.arrow} Restart your Node.js server: npm start`, 'cyan');

  log(`\n${symbols.warning} If DNS resolution failed:`, 'yellow');
  log(`   This is the most common cause of querySrv ECONNREFUSED`, 'yellow');
  log(`   ${symbols.arrow} Priority 1: Add your IP to MongoDB Atlas Network Access`, 'cyan');
  log(`   ${symbols.arrow} Priority 2: Flush Windows DNS: ipconfig /flushdns`, 'cyan');
  log(`   ${symbols.arrow} Priority 3: Test with: nslookup cluster0.yvpbgqi.mongodb.net`, 'cyan');

  log(`\n${symbols.info} MongoDB Atlas Documentation:`, 'blue');
  log(`   Network Access: https://docs.mongodb.com/manual/reference/atlas-setup/`, 'cyan');
  log(`   Connection Strings: https://docs.mongodb.com/drivers/node/`, 'cyan');
  log(`   Troubleshooting: https://docs.mongodb.com/atlas/troubleshoot-connection/`, 'cyan');

  console.log(`\n${colors.bright}${colors.green}═══════════════════════════════════════════════════════════${colors.reset}\n`);
}

diagnose().catch((error) => {
  log(`\n${symbols.error} Diagnostic Error: ${error.message}`, 'red');
  process.exit(1);
});
