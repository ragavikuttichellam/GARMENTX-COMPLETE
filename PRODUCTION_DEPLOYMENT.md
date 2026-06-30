# Production Deployment Guide: MongoDB Atlas + Docker + AWS

## 🚀 Pre-Deployment Security Checklist

### 1. MongoDB Atlas Configuration

#### IP Whitelist
- [ ] Add only production server IPs (not 0.0.0.0/0)
- [ ] Document all IP addresses that will connect
- [ ] For AWS: Add Elastic IP or use security group rules
- [ ] For Docker: Add container host IP and load balancer IPs
- [ ] Enable IP whitelist monitoring in Atlas

#### Database User Management
- [ ] Create dedicated user for production (not dev user)
- [ ] Give user only necessary permissions:
  - [ ] Database: `garmentx` (only)
  - [ ] Role: `readWrite@garmentx` (not admin)
- [ ] Strong password: 16+ characters, mixed case, numbers, special chars
- [ ] Enable IP whitelist for this user if possible
- [ ] Document user creation date and last rotated date

#### Backup & Monitoring
- [ ] Enable automated backups (at least daily)
- [ ] Configure alerts for connection failures
- [ ] Set up monitoring for slow queries
- [ ] Enable audit logging for sensitive operations

---

## 🐳 Docker Configuration

### Dockerfile for Node.js Backend

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "server.js"]
```

### docker-compose.yml for Development

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: garmentx-backend
    ports:
      - "5000:5000"
    environment:
      # Load from .env file
      - NODE_ENV=${NODE_ENV}
      - PORT=${PORT}
      - MONGO_URI=${MONGO_URI}
      - JWT_SECRET=${JWT_SECRET}
      - CLOUD_NAME=${CLOUD_NAME}
      - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
      - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
    volumes:
      - ./backend:/app
      - /app/node_modules
    restart: unless-stopped
    networks:
      - garmentx-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: garmentx-frontend
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api
    restart: unless-stopped
    networks:
      - garmentx-network

networks:
  garmentx-network:
    driver: bridge
```

**Run with:**
```bash
# Copy .env file
cp backend/.env.example backend/.env
# Edit .env with actual values

# Start containers
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop containers
docker-compose down
```

---

## ☁️ AWS Deployment (ECS/Fargate)

### AWS Secrets Manager Setup

**Store credentials securely in AWS Secrets Manager** instead of .env files:

```bash
# 1. Store MongoDB URI
aws secretsmanager create-secret \
  --name garmentx/mongodb-uri \
  --secret-string "mongodb+srv://user:password@cluster.mongodb.net/garmentx?retryWrites=true&w=majority" \
  --region us-east-1

# 2. Store JWT Secret
aws secretsmanager create-secret \
  --name garmentx/jwt-secret \
  --secret-string "your_32_character_jwt_secret_here" \
  --region us-east-1

# 3. Store Cloudinary credentials
aws secretsmanager create-secret \
  --name garmentx/cloudinary \
  --secret-string '{"CLOUD_NAME":"xxx","API_KEY":"xxx","API_SECRET":"xxx"}' \
  --region us-east-1

# Retrieve secrets
aws secretsmanager get-secret-value \
  --secret-id garmentx/mongodb-uri \
  --region us-east-1
```

### ECS Task Definition

```json
{
  "family": "garmentx-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "garmentx-backend",
      "image": "YOUR_ECR_REPO:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "5000"
        },
        {
          "name": "FRONTEND_URL",
          "value": "https://garmentx.com"
        }
      ],
      "secrets": [
        {
          "name": "MONGO_URI",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:garmentx/mongodb-uri"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:garmentx/jwt-secret"
        },
        {
          "name": "CLOUDINARY_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:garmentx/cloudinary:CLOUDINARY_API_KEY::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/garmentx-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ],
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole"
}
```

### IAM Role for ECS Task Execution

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:garmentx/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt"
      ],
      "Resource": "arn:aws:kms:us-east-1:ACCOUNT_ID:key/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:us-east-1:ACCOUNT_ID:log-group:/ecs/garmentx-backend:*"
    }
  ]
}
```

### MongoDB Atlas Network Access for AWS

1. **Get your ECS task security group ID**
   ```bash
   aws ec2 describe-security-groups --region us-east-1 \
     --filters Name=group-name,Values=ecs-tasks
   ```

2. **Add to MongoDB Atlas IP Whitelist**
   - Primary IP: ECS task security group IP range
   - For Fargate: Add NAT gateway Elastic IP
   - Or: Add ALB security group IPs
   - Or: Use AWS security group integration (if available)

**Example for AWS:**
- Fargate IP: Elastic IP of NAT gateway (e.g., `52.45.123.45/32`)
- ALB IP: Add all ALB subnet IPs
- RDS Proxy: Use proxy endpoint IP

---

## 🔐 Environment-Specific Configuration

### Development (.env)
```env
NODE_ENV=development
MONGO_URI=mongodb+srv://dev_user:pass@cluster0.mongodb.net/garmentx-dev
JWT_SECRET=dev_secret_123
FRONTEND_URL=http://localhost:3000
```

### Staging (.env.staging)
```env
NODE_ENV=staging
MONGO_URI=mongodb+srv://staging_user:pass@cluster0.mongodb.net/garmentx-staging
JWT_SECRET=staging_secret_456
FRONTEND_URL=https://staging.garmentx.com
```

### Production (AWS Secrets Manager)
```bash
# Never use .env files in production!
# All credentials stored in AWS Secrets Manager
```

---

## 🚨 Production Checklist

Before deploying to production:

### Security
- [ ] No credentials in Docker image or .env files
- [ ] All secrets in AWS Secrets Manager
- [ ] MongoDB user has minimum required permissions
- [ ] IP whitelist contains only production server IPs
- [ ] HTTPS/TLS enabled for all connections
- [ ] API rate limiting enabled
- [ ] CORS configured for production domain only
- [ ] Helmet.js security headers enabled
- [ ] JWT token expiration set (7d recommended)

### Monitoring
- [ ] CloudWatch logs configured
- [ ] MongoDB Atlas monitoring enabled
- [ ] Health checks configured for ECS
- [ ] Alerts set up for:
  - [ ] High CPU/Memory usage
  - [ ] Database connection failures
  - [ ] Error rate threshold exceeded
  - [ ] Response time degradation
- [ ] APM configured (DataDog, New Relic, etc.)

### Database
- [ ] Automated backups enabled
- [ ] Backup retention: 30+ days
- [ ] MongoDB Atlas backup location: different region
- [ ] Database indexing optimized
- [ ] Query performance analyzed

### Deployment
- [ ] Docker image scanned for vulnerabilities
- [ ] Dependencies updated and audited
- [ ] Blue-green deployment strategy
- [ ] Rollback plan documented
- [ ] Load testing completed
- [ ] Disaster recovery tested

---

## 📊 Scaling Configuration

### MongoDB Atlas Scaling
```javascript
// Connection pooling optimized for eCommerce
const mongoOptions = {
  maxPoolSize: 50,           // for production
  minPoolSize: 10,           // maintain minimum connections
  maxIdleTimeMS: 45000,      // close idle connections
  waitQueueTimeoutMS: 10000, // fail fast if no connections available
};

// Read preference for load distribution
const readPreference = 'secondaryPreferred'; // read from replicas if available
```

### AWS Load Balancing
```yaml
# docker-compose for load testing
version: '3.8'
services:
  backend:
    image: garmentx-backend:latest
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: garmentx-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG ./backend
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
      
      - name: Push to ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: garmentx-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
      
      - name: Update ECS service
        env:
          ECS_CLUSTER: garmentx-cluster
          ECS_SERVICE: garmentx-backend
        run: |
          aws ecs update-service \
            --cluster $ECS_CLUSTER \
            --service $ECS_SERVICE \
            --force-new-deployment
```

---

## 🎯 Performance Optimization

### Database Indexing
```javascript
// models/Product.js
const productSchema = new Schema({
  name: { type: String, index: true },
  category: { type: String, index: true },
  price: { type: Number, index: true },
  createdAt: { type: Date, index: true, default: Date.now },
  sku: { type: String, unique: true, index: true },
}, { timestamps: true });

// Create compound indexes for common queries
productSchema.index({ category: 1, price: -1 });
productSchema.index({ createdAt: -1 });
```

### Connection Pool Optimization
```javascript
// For 1000+ concurrent users
const mongoOptions = {
  maxPoolSize: 50,
  minPoolSize: 20,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxIdleTimeMS: 45000,
  waitQueueTimeoutMS: 10000,
};
```

### Caching Strategy
```javascript
// Use Redis for caching frequently accessed data
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

// Cache product listings
app.get('/api/products', async (req, res) => {
  const cacheKey = `products:${JSON.stringify(req.query)}`;
  
  // Try cache first
  const cached = await client.getAsync(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
  
  // Query database
  const products = await Product.find(req.query);
  
  // Cache for 1 hour
  await client.setexAsync(cacheKey, 3600, JSON.stringify(products));
  res.json(products);
});
```

---

## 📋 Post-Deployment Verification

```bash
#!/bin/bash
# deploy-verify.sh

echo "🔍 Post-Deployment Verification"
echo "════════════════════════════════════════"

# 1. Check MongoDB connection
echo "1️⃣  Testing MongoDB connection..."
curl -s http://localhost:5000/api/health | jq .

# 2. Check API endpoints
echo "2️⃣  Testing API endpoints..."
curl -s http://localhost:5000/api/products | jq '.length'

# 3. Check response time
echo "3️⃣  Measuring response time..."
time curl -s http://localhost:5000/api/products > /dev/null

# 4. Check error logs
echo "4️⃣  Checking error logs..."
docker logs garmentx-backend | grep -i error | tail -5

# 5. Check database
echo "5️⃣  Checking database..."
mongosh "mongodb+srv://..." --eval "db.serverStatus()"

echo "✅ Verification complete"
```

---

## 🆘 Emergency Rollback

```bash
#!/bin/bash
# rollback-production.sh

PREVIOUS_IMAGE_TAG="v1.0.0"
ECS_CLUSTER="garmentx-cluster"
ECS_SERVICE="garmentx-backend"

echo "🔄 Rolling back to $PREVIOUS_IMAGE_TAG..."

aws ecs update-service \
  --cluster $ECS_CLUSTER \
  --service $ECS_SERVICE \
  --force-new-deployment \
  --region us-east-1

# Monitor rollback
aws ecs describe-services \
  --cluster $ECS_CLUSTER \
  --services $ECS_SERVICE \
  --region us-east-1 | jq '.services[0].deployments'

echo "✅ Rollback initiated"
```

---

## 📚 Useful Commands

```bash
# View ECS logs
aws logs tail /ecs/garmentx-backend --follow

# Restart ECS service
aws ecs update-service --cluster garmentx-cluster --service garmentx-backend --force-new-deployment

# View MongoDB Atlas metrics
# https://cloud.mongodb.com → Cluster → Metrics

# Scale ECS service
aws ecs update-service --cluster garmentx-cluster --service garmentx-backend --desired-count 5

# SSH into container (for debugging)
aws ecs execute-command --cluster garmentx-cluster --task <task-id> --container garmentx-backend --interactive --command "/bin/sh"
```
