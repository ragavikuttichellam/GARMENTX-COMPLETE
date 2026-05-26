# GarmentX - DEPLOYMENT & PRODUCTION CHECKLIST

## Pre-Deployment Checklist

### Code Quality
- [ ] Run ESLint on all files
- [ ] Check console.log statements removed
- [ ] Verify no hardcoded credentials
- [ ] Test all features manually
- [ ] Run unit tests (if available)
- [ ] Check browser console for errors
- [ ] Verify responsive design on mobile

### Security Review
- [ ] Change default passwords
- [ ] Enable HTTPS/SSL
- [ ] Set CORS properly (not wildcard)
- [ ] Review environment variables
- [ ] Check input validation
- [ ] Verify JWT expiry times
- [ ] Enable rate limiting
- [ ] Check sensitive data exposure

### Performance Optimization
- [ ] Optimize images (use WebP)
- [ ] Minimize CSS/JS
- [ ] Enable gzip compression
- [ ] Set cache headers
- [ ] Use CDN for static assets
- [ ] Check Lighthouse score (aim >90)
- [ ] Optimize database queries
- [ ] Test load time under 3s

### Backend Preparation
- [ ] Database backed up
- [ ] Database migrations tested
- [ ] API endpoints documented
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Monitoring setup
- [ ] Backup strategy defined
- [ ] Rollback plan documented

### Frontend Preparation
- [ ] Build tested locally
- [ ] Environment variables set
- [ ] API endpoints configured
- [ ] Error pages created
- [ ] Offline handling (if needed)
- [ ] Analytics integrated
- [ ] Social media links added
- [ ] Legal pages (T&C, Privacy) added

---

## Deployment Platforms

### Option 1: Heroku (Easiest)

#### Backend Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create garmentx-backend

# Add buildpack
heroku buildpacks:add heroku/nodejs

# Set environment variables
heroku config:set MONGODB_URI="your_mongo_uri"
heroku config:set JWT_SECRET="your_secret"
heroku config:set CLOUDINARY_CLOUD_NAME="your_name"
heroku config:set CLOUDINARY_API_KEY="your_key"
heroku config:set CLOUDINARY_API_SECRET="your_secret"
heroku config:set RAZORPAY_KEY_ID="your_id"
heroku config:set RAZORPAY_KEY_SECRET="your_secret"

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### Frontend Deployment
```bash
# Build
npm run build

# Deploy to Vercel
npm install -g vercel
vercel --prod
```

### Option 2: AWS (Scalable)

#### EC2 Deployment
```bash
# Connect to EC2
ssh -i key.pem ubuntu@your-instance-ip

# Install Node & MongoDB
sudo apt-get update
sudo apt-get install nodejs npm mongodb

# Clone repository
git clone your-repo-url
cd garmentx

# Setup backend
cd backend
npm install
npm start

# Setup frontend
cd ../frontend
npm install
npm run build
npm install -g serve
serve -s build
```

#### RDS for MongoDB
- Create MongoDB cluster
- Set security groups
- Connect backend to RDS

### Option 3: Docker & Kubernetes

#### Dockerfile (Backend)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

#### Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/garmentx
      - JWT_SECRET=your_secret
    depends_on:
      - mongo
  
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
  
  mongo:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

#### Deploy with Docker
```bash
docker-compose up -d
```

### Option 4: DigitalOcean (Affordable)

#### Using App Platform
1. Connect GitHub repo
2. Set environment variables
3. Set build command: `npm install && npm run build`
4. Set run command: `npm start`
5. Deploy

---

## MongoDB Atlas Setup (Cloud Database)

1. Create account at mongodb.com/cloud
2. Create free cluster
3. Add network access (IP whitelist)
4. Create database user
5. Get connection string
6. Set in environment variables

---

## Cloudinary Setup (Media CDN)

1. Create account at cloudinary.com
2. Get Cloud Name, API Key, API Secret
3. Create upload preset (optional)
4. Set in environment variables

---

## Razorpay Setup (Payment Gateway)

1. Create account at razorpay.com
2. Complete KYC verification
3. Get API Key ID and Secret
4. Set test mode for testing
5. Set in environment variables

---

## Domain & SSL Setup

### Get Domain
- Namecheap, GoDaddy, or Google Domains

### Get SSL Certificate
- Let's Encrypt (Free)
- AWS Certificate Manager (Free with AWS)
- Cloudflare (Free)

### Setup DNS
```
A Record: @ -> Your-Server-IP
CNAME: www -> your-domain.com
```

---

## Monitoring & Analytics

### Application Monitoring
- Sentry (Error tracking)
- LogRocket (Session replay)
- New Relic (Performance)

### Analytics
- Google Analytics 4
- Mixpanel
- Amplitude

### Uptime Monitoring
- UptimeRobot
- Pingdom
- StatusCake

---

## Backup & Recovery

### Database Backup
```bash
# Backup MongoDB
mongodump --uri="mongodb://..." --out ./backup

# Restore MongoDB
mongorestore ./backup
```

### AWS S3 Backup
- Enable versioning
- Set lifecycle policies
- Automate backups

---

## Performance Tuning

### CDN Setup (Cloudflare)
1. Add site to Cloudflare
2. Update nameservers
3. Enable caching
4. Set cache rules

### Database Optimization
- Create indexes
- Limit response size
- Use pagination
- Cache frequently accessed data

### API Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);
```

---

## Scaling Strategy

### Phase 1 (0-1K users)
- Single server
- Single database
- Basic monitoring

### Phase 2 (1K-10K users)
- Load balancer
- Database replication
- Advanced monitoring
- Caching layer (Redis)

### Phase 3 (10K+ users)
- Microservices
- Kubernetes cluster
- Multiple databases
- Global CDN
- Message queues

---

## Post-Deployment Tasks

- [ ] Test all features in production
- [ ] Monitor error logs
- [ ] Check payment processing
- [ ] Verify email notifications
- [ ] Test user registration/login
- [ ] Check image uploads
- [ ] Verify admin dashboard
- [ ] Monitor server performance
- [ ] Setup automated backups
- [ ] Configure monitoring alerts

---

## Emergency Procedures

### If Production Goes Down
1. Check server logs
2. Verify database connection
3. Check payment gateway status
4. Notify users (if customer-facing)
5. Implement hotfix
6. Deploy fix
7. Verify functionality
8. Post-incident review

### Rollback Plan
```bash
# Revert to previous deployment
git revert commit-hash
git push
# Redeploy
```

---

## Monthly Maintenance

- [ ] Review error logs
- [ ] Check database performance
- [ ] Update dependencies
- [ ] Review security patches
- [ ] Backup data
- [ ] Check disk space
- [ ] Monitor costs
- [ ] Review user feedback

---

## Contact & Support

- **Monitoring Dashboard**: Link here
- **Error Tracking**: Link here
- **Team Slack**: #production-alerts
- **On-Call**: Contact details

---

**Last Updated**: May 25, 2024
**Status**: Ready for Production
