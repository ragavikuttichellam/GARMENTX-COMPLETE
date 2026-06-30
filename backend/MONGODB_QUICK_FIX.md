# MongoDB Connection - QUICK FIX GUIDE

> **99% of the time, the fix is adding your IP to MongoDB Atlas Network Access**

---

## 🚨 Error: querySrv ECONNREFUSED

```
MongoDB Error:
querySrv ECONNREFUSED _mongodb._tcp.cluster0.yvpbgqi.mongodb.net
```

---

## ⚡ 5-Minute Quick Fix

### 1. **Find Your IP** (30 seconds)
```powershell
(Invoke-WebRequest -Uri "https://api.ipify.org?format=json").Content | ConvertFrom-Json
```
Or: https://whatismyipaddress.com/

### 2. **Add to MongoDB Atlas** (2 minutes)
1. Go to: https://cloud.mongodb.com
2. Click: Network Access (left sidebar)
3. Click: "Add IP Address"
4. Enter: `YOUR_IP/32` (e.g., `203.45.67.89/32`)
5. Click: "Confirm"
6. **⏳ Wait 5 minutes** for propagation

### 3. **Update .env File** (1 minute)
```env
# Replace <db_password> with ACTUAL password
MONGO_URI=mongodb+srv://ragavikuttichellam_db_user:YOUR_ACTUAL_PASSWORD@cluster0.yvpbgqi.mongodb.net/garmentx?retryWrites=true&w=majority
```

### 4. **Flush DNS** (1 minute)
```powershell
ipconfig /flushdns
```

### 5. **Restart Server** (1 minute)
```bash
npm start
```

**✅ Should work now!**

---

## 📋 If That Didn't Work...

### Option 1: Test DNS Resolution
```powershell
nslookup cluster0.yvpbgqi.mongodb.net
nslookup -type=SRV _mongodb._tcp.cluster0.yvpbgqi.mongodb.net
```

### Option 2: Test Network Connectivity
```powershell
Test-NetConnection -ComputerName cluster0.yvpbgqi.mongodb.net -Port 27017 -InformationLevel "Detailed"
```

### Option 3: Use Diagnostic Tool
```bash
node scripts/diagnoseMongoConnection.js
```

### Option 4: Check MongoDB Atlas Status
1. Go to: https://cloud.mongodb.com
2. Check cluster status: Should be GREEN/AVAILABLE
3. If PAUSED: Click "Resume"
4. Check Network Access: Your IP should be listed

### Option 5: Regenerate Password
1. Go to: https://cloud.mongodb.com
2. Database Access → Find user → Edit
3. Click "Edit Password"
4. Select "Autogenerate Secure Password"
5. Copy password (shown only once)
6. Update .env with new password

---

## ✅ Correct Connection String Format

```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Required parts:**
- ✅ `mongodb+srv://` (must include "srv")
- ✅ Username after `://`
- ✅ Actual password (not `<db_password>`)
- ✅ Database name (e.g., `/garmentx`)
- ✅ Connection parameters (`?retryWrites=true&w=majority`)

**Example:**
```
mongodb+srv://ragavikuttichellam_db_user:MyPassword123!@cluster0.yvpbgqi.mongodb.net/garmentx?retryWrites=true&w=majority
```

---

## 🔍 Common Issues & Solutions

| Error | Cause | Fix |
|-------|-------|-----|
| `querySrv ECONNREFUSED` | IP not whitelisted (99%) | Add IP to Network Access |
| `querySrv ECONNREFUSED` | `<db_password>` placeholder | Replace with actual password |
| `authentication failed` | Wrong username/password | Verify in Database Access |
| `timeout` | Cluster paused or wrong IP | Resume cluster or fix IP whitelist |
| `no suitable servers` | Cluster status issue | Check cluster is AVAILABLE |

---

## 🧪 Test Your Connection

### Using Node.js Script
```javascript
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  });
```

Run: `node test-mongo.js`

### Using Command Line
```bash
node scripts/diagnoseMongoConnection.js
```

---

## 📊 MongoDB Atlas Configuration Checklist

- [ ] Cluster created (should be GREEN/AVAILABLE)
- [ ] Database user created with password
- [ ] User IP added to Network Access whitelist
- [ ] User has read/write roles for `garmentx` database
- [ ] Connection string format correct (mongodb+srv://)
- [ ] No placeholder text (`<db_password>`)
- [ ] Database name specified in URI
- [ ] 5+ minutes waited after adding IP whitelist

---

## 🔐 Security Tips

1. **Never commit .env to Git**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Use strong passwords** (16+ chars)
   - Mix: UPPERCASE, lowercase, 123, special!chars

3. **URL encode special characters** if needed
   - `P@ssw0rd!` → `P%40ssw0rd%21`
   - Use: `encodeURIComponent("password")`

4. **Different passwords for different environments**
   - Development: One user/password
   - Production: Different user/password

5. **Create separate MongoDB users**
   - App User: read/write to garmentx database
   - Admin User: admin access (dev only)
   - Read-only user: for backups/monitoring

---

## 📞 Need More Help?

1. **Read full guide:** `MONGODB_TROUBLESHOOTING.md`
2. **Check diagnostics:** `node scripts/diagnoseMongoConnection.js`
3. **MongoDB docs:** https://docs.mongodb.com/atlas/troubleshoot-connection/
4. **Test IP resolution:**
   ```powershell
   nslookup cluster0.yvpbgqi.mongodb.net
   ```

---

## 🚀 Next Steps (After Connection Works)

1. ✅ Verify connection with: `npm start`
2. ✅ Test API endpoints: `curl http://localhost:5000/api/products`
3. ✅ Check database: API should return data
4. ✅ Try creating an order to test write access
5. ✅ Review logs for any errors
6. ✅ Deploy to production when ready

---

**Last Updated:** June 5, 2026  
**Status:** Production Ready ✅  
**Tested:** Yes ✅
