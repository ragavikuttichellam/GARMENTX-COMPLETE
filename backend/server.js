const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const databaseUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;
app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS || 1));

if (!jwtSecret || jwtSecret.length < 32) {
  console.error('❌ ERROR: JWT_SECRET environment variable is required and must be at least 32 characters long');
  process.exit(1);
}

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// ─── Body Parser ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Require an explicit database URI so the server cannot silently connect to the wrong database.
if (!databaseUri) {
  console.error('❌ ERROR: MONGODB_URI or MONGO_URI environment variable is required');
  console.error('   Set MONGO_URI in .env file with format:');
  console.error('   MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/database?retryWrites=true&w=majority');
  process.exit(1);
}

// Validate connection string before attempting connection
if (databaseUri.includes('<db_password>') || databaseUri.includes('<password>')) {
  console.error('❌ ERROR: Connection string contains placeholder <db_password>');
  console.error('   Replace <db_password> with actual password in .env file');
  process.exit(1);
}

// ─── MongoDB Connection (Production-Ready) ────────────────────────────────────
mongoose.connect(databaseUri, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  maxPoolSize: 10,
  minPoolSize: 5,
  appName: 'garmentx-app',
  authSource: 'admin',
  family: 4,
})
.then((connection) => {
  console.log(`✅  MongoDB Connected`);
  console.log(`   Host: ${connection.connection.host}`);
  console.log(`   Port: ${connection.connection.port}`);
  // Mongoose connection object shape can vary between versions.
  // Use a resilient lookup for the database name instead of calling getName().
  const conn = connection.connection;
  const dbName = conn?.name || conn?.db?.databaseName || conn?.db?.s?.databaseName || 'unknown';
  console.log(`   Database: ${dbName}`);
})
.catch((err) => {
  console.error('❌  MongoDB Connection Error:');
  console.error(`   Message: ${err.message}`);
  
  if (err.message.includes('ECONNREFUSED') || err.message.includes('querySrv')) {
    console.error('\n   💡 Diagnosis: DNS/Network connectivity issue');
    console.error('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('   1. Add your IP to MongoDB Atlas Network Access');
    console.error('      → https://cloud.mongodb.com → Network Access');
    console.error('   2. Verify connection string format (check for <db_password> placeholder)');
    console.error('   3. Windows DNS cache issue? Run: ipconfig /flushdns');
    console.error('   4. Firewall/Antivirus blocking port 27017?');
    console.error('      → Test: Test-NetConnection -ComputerName cluster0.yvpbgqi.mongodb.net -Port 27017');
  } else if (err.message.includes('authentication failed') || err.message.includes('Invalid credentials')) {
    console.error('\n   💡 Diagnosis: Authentication/Credentials issue');
    console.error('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('   1. Verify username and password in MongoDB Atlas');
    console.error('   2. If password has special chars (@, !, #), URL-encode them');
    console.error('   3. Regenerate password in Database Access settings');
  } else if (err.message.includes('timed out')) {
    console.error('\n   💡 Diagnosis: Connection timeout');
    console.error('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('   1. Check IP whitelist in Atlas Network Access');
    console.error('   2. Verify cluster is not paused');
    console.error('   3. Slow network? Increase serverSelectionTimeoutMS');
  }
  
  process.exit(1);
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Manisara World API is running', timestamp: new Date() });
});

// ─── Error Handlers ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\nManisara World Server -> http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`ERROR: Port ${PORT} is already in use.`);
    console.error('Close the process using that port or start this API with a different PORT value.');
    console.error('PowerShell example: $env:PORT=5001; npm start');
    process.exit(1);
  }

  console.error('ERROR: Failed to start server.');
  console.error(err);
  process.exit(1);
});
