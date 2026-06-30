# MongoDB Atlas Connection Troubleshooting Guide

## 🚨 Quick Fix for querySrv ECONNREFUSED

If you're seeing this error:
```
MongoDB Error:
querySrv ECONNREFUSED _mongodb._tcp.cluster0.yvpbgqi.mongodb.net
```

**99% of the time the fix is:**

1. **Add your IP to MongoDB Atlas Network Access**
   - Go to: https://cloud.mongodb.com
   - Click your project → Network Access
   - Click "Add IP Address"
   - Your IP: https://whatismyipaddress.com/
   - Add it as: `YOUR_IP/32`
   - Wait 5 minutes for propagation

2. **Flush Windows DNS Cache**
   ```powershell
   ipconfig /flushdns
   ```

3. **Replace placeholder password in .env**
   ```env
   # ❌ WRONG
   MONGO_URI=mongodb+srv://user:<db_password>@cluster0.yvpbgqi.mongodb.net/garmentx

   # ✅ CORRECT
   MONGO_URI=mongodb+srv://user:ACTUAL_PASSWORD_HERE@cluster0.yvpbgqi.mongodb.net/garmentx?retryWrites=true&w=majority
   ```

4. **Restart your Node.js server**
   ```bash
   npm start
   ```

---

## 📋 Complete Troubleshooting Checklist

### ✅ Step 1: Verify Connection String Format

Your connection string should look like:
```
mongodb+srv://username:password@cluster0.yvpbgqi.mongodb.net/database?retryWrites=true&w=majority
```

**Check these points:**
- [ ] Starts with `mongodb+srv://` (not `mongodb://`)
- [ ] Has username after `://`
- [ ] Has `:` after username
- [ ] Has password after `:`
- [ ] Has `@` after password
- [ ] Has cluster domain (e.g., `cluster0.yvpbgqi.mongodb.net`)
- [ ] No `<db_password>` or `<password>` placeholders
- [ ] Database name specified: `/garmentx?`
- [ ] Connection parameters: `?retryWrites=true&w=majority`

**Example:**
```
mongodb+srv://ragavikuttichellam_db_user:MyActualPassword123!@cluster0.yvpbgqi.mongodb.net/garmentx?retryWrites=true&w=majority
```

---

### ✅ Step 2: Check MongoDB Atlas Network Access

1. **Log in to MongoDB Atlas**: https://cloud.mongodb.com
2. **Select your project and cluster**
3. **Go to Settings → Network Access**
4. **Look for your IP address in the whitelist**

**If not found:**

1. **Find your public IP:**
   ```powershell
   # Windows PowerShell
   (Invoke-WebRequest -Uri "https://api.ipify.org?format=json").Content | ConvertFrom-Json
   ```
   Or visit: https://whatismyipaddress.com/

2. **Add IP to whitelist:**
   - Click "Add IP Address"
   - Enter your IP: `YOUR_IP/32`
   - Or allow all (dev only): `0.0.0.0/0` (NOT for production)
   - Click "Confirm"

3. **Wait 5 minutes** for changes to propagate

---

### ✅ Step 3: Verify Database User Credentials

1. **Log in to MongoDB Atlas**: https://cloud.mongodb.com
2. **Go to Database Access** (left sidebar)
3. **Find your user:** `ragavikuttichellam_db_user`
4. **Check user status:** Should show "Admin" or have specific database roles

**If user doesn't exist or has issues:**

1. **Reset password:**
   - Click user name → "Edit"
   - Click "Edit Password"
   - Select "Autogenerate Secure Password"
   - Copy the password (shown only once)
   - Click "Update User"
   - Update your .env file with new password

2. **Verify user has correct roles:**
   - User should have:
     - Database: Any Database (or specific to "garmentx")
     - Role: Read/Write to any database

---

### ✅ Step 4: Test DNS Resolution

Run these commands in **PowerShell (Admin)**:

```powershell
# Test A record (regular DNS)
nslookup cluster0.yvpbgqi.mongodb.net
# Expected output: Should show IP addresses

# Test SRV record (important for MongoDB)
nslookup -type=SRV _mongodb._tcp.cluster0.yvpbgqi.mongodb.net
# Expected output: Should list SRV records with mongodb.net endpoints

# If DNS lookup fails, flush cache:
ipconfig /flushdns

# Then try DNS lookup again:
nslookup cluster0.yvpbgqi.mongodb.net
```

**If nslookup returns "Non-existent domain":**
- Check your cluster domain spelling
- Verify it matches what's in MongoDB Atlas connect dialog
- May need to flush DNS again and wait

---

### ✅ Step 5: Test Network Connectivity

```powershell
# Test port 27017 accessibility
Test-NetConnection -ComputerName cluster0.yvpbgqi.mongodb.net -Port 27017 -InformationLevel "Detailed"

# Expected output: TcpTestSucceeded should be True
# If False: Firewall/Antivirus blocking the connection
```

---

### ✅ Step 6: Check Firewall & Antivirus

**Windows Firewall:**
```powershell
# Check firewall rules
Get-NetFirewallProfile
Get-NetFirewallRule -Direction Outbound -Enabled True | Where-Object {$_.Action -eq 'Block'} | Format-Table Name,Direction,Action
```

**Common blockers:**
- Windows Defender
- Norton, McAfee, Kaspersky antivirus
- Corporate proxy or VPN
- ISP blocking (rare, but possible)

**Solutions:**
1. Add Node.js to firewall whitelist
2. Temporarily disable antivirus to test
3. Check if ISP blocks port 27017 (try VPN)

---

### ✅ Step 7: Test MongoDB Connection with Node.js

Create a test file: `testMongo.js`

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

console.log('Testing MongoDB connection...');
console.log('URI:', uri.replace(/:[^@]*@/, ':****@')); // Hide password

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ Connected to MongoDB!');
  console.log('Host:', mongoose.connection.host);
  console.log('Database:', mongoose.connection.db.getName());
  process.exit(0);
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  console.error('Code:', err.code);
  process.exit(1);
});
```

Run it:
```bash
node testMongo.js
```

---

## 🔧 Error Diagnosis Guide

### querySrv ECONNREFUSED
**Means:** Cannot resolve MongoDB SRV DNS records

**Causes (in order of likelihood):**
1. Your IP not in MongoDB Atlas Network Access whitelist (MOST COMMON)
2. Connection string syntax error
3. Firewall/Antivirus blocking port 27017
4. DNS resolver issue (Windows DNS cache)
5. ISP blocking MongoDB
6. `<db_password>` placeholder not replaced

**Fixes:**
1. Add IP to Atlas Network Access (wait 5 min)
2. Verify connection string format
3. Check firewall: `Test-NetConnection -ComputerName cluster0.yvpbgqi.mongodb.net -Port 27017`
4. Flush DNS: `ipconfig /flushdns`
5. Test DNS: `nslookup -type=SRV _mongodb._tcp.cluster0.yvpbgqi.mongodb.net`

---

### Authentication Failed / Invalid Credentials
**Means:** Username or password is incorrect

**Causes:**
1. Password doesn't match in Database Access
2. Password contains special characters that need URL encoding
3. Wrong username
4. User was deleted/disabled

**Fixes:**
1. Verify username in Database Access
2. URL encode special characters in password:
   - `@` → `%40`
   - `!` → `%21`
   - `#` → `%23`
   - `$` → `%24`
   - `%` → `%25`
3. Regenerate password in Database Access → Edit User → Edit Password
4. Example: `P@ssw0rd!` → `P%40ssw0rd%21`

**Python/JavaScript URL encoding:**
```javascript
const password = "P@ssw0rd!123";
const encoded = encodeURIComponent(password);
// Result: P%40ssw0rd%21123
const uri = `mongodb+srv://user:${encoded}@cluster.mongodb.net/db`;
```

---

### Connection Timeout
**Means:** Connection took too long to establish

**Causes:**
1. IP whitelist issue (can't reach cluster)
2. Cluster is paused
3. Very slow network connection
4. Firewall timeout policy

**Fixes:**
1. Verify IP in Network Access whitelist
2. Check cluster status (should be "AVAILABLE")
3. Increase timeout values in connection options
4. Check firewall/router settings

**Increased timeout example:**
```javascript
mongoose.connect(uri, {
  serverSelectionTimeoutMS: 15000,  // was 10000
  socketTimeoutMS: 60000,            // was 45000
  connectTimeoutMS: 15000,
});
```

---

### No Suitable Servers Found
**Means:** Cannot find any MongoDB servers after DNS lookup succeeded

**Causes:**
1. Cluster is paused
2. Cluster has issues
3. Incorrect database name in URI
4. User doesn't have access to cluster

**Fixes:**
1. Check cluster status in Atlas (should be green/AVAILABLE)
2. If paused, click "Resume"
3. Verify database name in connection string
4. Verify user has cluster access

---

## 🧪 Diagnostic Tool

Run the built-in diagnostic:

```bash
node scripts/diagnoseMongoConnection.js
```

This will check:
- ✅ Environment variables
- ✅ Connection string format
- ✅ DNS A records
- ✅ DNS SRV records
- ✅ Network connectivity
- ✅ MongoDB Atlas connection
- ✅ Database access
- ✅ Read/Write permissions

---

## 🚀 Complete .env Template

```env
# Node Environment
NODE_ENV=development
PORT=5000

# MongoDB Atlas
# Format: mongodb+srv://user:password@cluster.mongodb.net/database?options
# Get from: MongoDB Atlas → Cluster → Connect → Connect your application
MONGO_URI=mongodb+srv://ragavikuttichellam_db_user:YOUR_ACTUAL_PASSWORD@cluster0.yvpbgqi.mongodb.net/garmentx?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_32_character_minimum_secret_here_generated_randomly
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=another_32_char_minimum_secret_for_refresh_tokens
REFRESH_TOKEN_EXPIRES_IN=30d

# Cloudinary (Image Hosting)
CLOUD_NAME=dammkjmb5
CLOUDINARY_API_KEY=451896766674666
CLOUDINARY_API_SECRET=your_actual_secret_here

# Frontend
FRONTEND_URL=http://localhost:3000

# Network
TRUST_PROXY_HOPS=1
```

---

## 🔒 Security Best Practices

1. **Never commit .env to Git**
   ```bash
   # Add to .gitignore
   echo ".env" >> .gitignore
   ```

2. **Use strong passwords**
   - Minimum 16 characters
   - Mix of: uppercase, lowercase, numbers, special characters
   - Example: `Gar#ment2024@X!Secure`

3. **Regenerate secrets every 90 days**
   - Generate new JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Rotate MongoDB passwords
   - Rotate Cloudinary keys

4. **Use environment-specific credentials**
   - Development: Liberal IP whitelist (can be 0.0.0.0/0)
   - Production: Specific IPs of your servers only
   - Create separate MongoDB users per environment

5. **Encrypt sensitive data in transit**
   - Always use `mongodb+srv://` (encrypted connection)
   - Use HTTPS for frontend
   - Enable SSL/TLS for all connections

---

## 📞 Getting Help

If still stuck, you have:

1. **Run diagnostic tool:**
   ```bash
   node scripts/diagnoseMongoConnection.js
   ```

2. **Check MongoDB Atlas logs:**
   - Atlas console → Activity Feed
   - Check for connection attempts and failures

3. **Review error code on MongoDB docs:**
   - https://docs.mongodb.com/drivers/node/current/

4. **Test basic connectivity:**
   ```bash
   mongosh "mongodb+srv://user:password@cluster.mongodb.net/database"
   ```

5. **Check if cluster is accessible:**
   - Try connecting from different network (4G, different WiFi)
   - Try different DNS (8.8.8.8 instead of ISP DNS)

---

## 📚 Additional Resources

- [MongoDB Atlas Network Access Setup](https://docs.mongodb.com/manual/reference/atlas-setup/)
- [MongoDB Connection Strings](https://docs.mongodb.com/drivers/node/current/)
- [Troubleshooting MongoDB Atlas Connections](https://docs.mongodb.com/atlas/troubleshoot-connection/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Community Forum](https://community.mongodb.com/)
