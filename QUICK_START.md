# 🚀 GarmentX - Quick Start Guide & Docker Setup

## ⚡ Get Started in 5 Minutes

### Option 1: Docker (Recommended - Easiest) ✅

#### Prerequisites
- Docker & Docker Compose installed
- 4GB RAM minimum

#### Steps
```bash
# 1. Navigate to project root
cd garmentx

# 2. Start everything with Docker
docker-compose up

# 3. Access the application
# Frontend: http://localhost
# Backend API: http://localhost:5000/api
# Mongo Express (Database): http://localhost:8081
```

**That's it!** Your full stack is running! ✨

---

### Option 2: Manual Setup

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

#### Frontend (New Terminal)
```bash
cd frontend
npm install
npm start
```

---

## 📝 Environment Configuration

### .env Template

```bash
# Database
MONGODB_URI=mongodb://admin:password123@localhost:27017/garmentx

# Server
PORT=5000
JWT_SECRET=change_this_in_production
FRONTEND_URL=http://localhost:3000

# Cloudinary (Optional - for image upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Razorpay (Optional - for payments)
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your_secret
```

---

## ✅ What's Included

### Frontend Features
- ✅ Modern home page with hero, products, testimonials
- ✅ Product listing with filters & search
- ✅ Product detail with images, variants, reviews
- ✅ Shopping cart with calculations
- ✅ Multi-step checkout
- ✅ Payment success/failed pages
- ✅ User profile with orders
- ✅ WhatsApp integration
- ✅ Mobile responsive
- ✅ Luxury UI design

### Backend Features
- ✅ User authentication (JWT)
- ✅ Product management
- ✅ Order processing
- ✅ Payment gateway (Razorpay)
- ✅ Admin dashboard
- ✅ Invoice generation
- ✅ Email notifications
- ✅ Security (Helmet, CORS, Rate limiting)

### DevOps
- ✅ Docker containerization
- ✅ Docker Compose orchestration
- ✅ Nginx web server
- ✅ MongoDB integration
- ✅ Health checks

---

## 🧪 Test Features

### User Registration
```
Email: test@example.com
Password: Test@123
Phone: 9876543210
```

### Demo User
```
Email: demo@example.com
Password: Demo@123
```

### Admin Access
```
Email: admin@garmentx.com
Password: (set during setup)
```

### Razorpay Test Payment
```
Card: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any 3 digits
```

---

## 📂 Project Structure

```
garmentx/
├── backend/                    # Node.js + Express server
│   ├── controllers/           # Business logic
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API endpoints
│   ├── middleware/           # Auth, validation
│   ├── utils/                # Helpers & validators
│   ├── config/               # Database, services
│   └── Dockerfile
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable UI
│   │   ├── context/          # State management
│   │   └── utils/            # API client
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml         # Full stack orchestration
└── Documentation files
```

---

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create (admin)
- `PUT /api/products/:id` - Update (admin)
- `DELETE /api/products/:id` - Delete (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details

### Payments
- `POST /api/payments/razorpay` - Create payment
- `POST /api/payments/verify-razorpay` - Verify payment

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Solution: Ensure MongoDB is running or use MongoDB Atlas
Update MONGODB_URI in .env
```

### Port Already in Use
```
Solution: Change PORT in .env or stop the process using that port
```

### Cloudinary Error
```
Solution: Update Cloudinary credentials in .env
Ensure API key and secret are correct
```

### Docker Issues
```
docker-compose down  # Stop all
docker-compose up --build  # Rebuild
```

---

## 📊 Database Models

### User
- name, email, phone, password (hashed)
- addresses (array of address objects)
- loyaltyPoints, createdAt

### Product  
- name, description, price, category
- colors (array), sizes (array)
- images (array), stock
- featured, trending, rating

### Order
- user (reference), items (array)
- address (reference), paymentMethod
- status, totalAmount, paymentStatus
- createdAt, updatedAt

---

## 🔒 Security

- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Helmet Headers
- ✅ CORS Protection  
- ✅ Rate Limiting
- ✅ Input Validation
- ✅ Admin Authorization

---

## 📈 Next Steps

### 1. Local Development
- Start with Docker Compose
- Browse to http://localhost
- Test all features

### 2. Add Your Data
- Create admin account
- Add products
- Configure payment gateway

### 3. Customize
- Update branding
- Add your products
- Configure email

### 4. Deploy
- See DEPLOYMENT_GUIDE.md
- Choose your platform (Heroku, AWS, DigitalOcean)
- Deploy to production

---

## 📚 Documentation

- **COMPLETE_SETUP_GUIDE.md** - Full setup & configuration
- **DEPLOYMENT_GUIDE.md** - Production deployment
- **FEATURES_COMPLETE_LIST.md** - All 100+ features
- **ADMIN_PANEL_DOCUMENTATION.md** - Admin features

---

## 🎯 Commands

### Docker
```bash
docker-compose up              # Start
docker-compose up -d           # Start background
docker-compose down            # Stop
docker-compose logs backend    # View logs
docker-compose ps              # Check status
```

### Backend
```bash
npm start      # Production
npm run dev    # Development
npm run seed   # Seed data
```

### Frontend
```bash
npm start      # Development
npm run build  # Production build
```

---

## 🎉 You're Ready!

**Everything is set up and ready to go!**

🌐 Frontend: http://localhost  
🔌 Backend: http://localhost:5000  
💾 Database: http://localhost:8081  

**Happy coding!** ❤️
- Update order status
- View full invoice details & GST
- Download invoices & view barcodes
- Customer contact information

### 3. **Security & Authorization**
- JWT token-based authentication
- Role-based access control (user/admin)
- Order ownership validation
- Protected API routes
- Stock restoration on cancellation

---

## 🎯 Files Created/Modified

### Frontend (React)
```
✅ frontend/src/pages/OrderDetailUser.js    - User order details with timeline
✅ frontend/src/pages/AdminOrdersPage.js    - Admin orders list with search
✅ frontend/src/pages/AdminOrderDetail.js   - Admin order detail view
✅ frontend/src/components/InvoiceDetails.js - Invoice management component
✅ frontend/src/utils/api.js                - Updated API endpoints
✅ frontend/src/App.js                      - Updated routing
```

### Backend (Node.js)
```
✅ backend/controllers/orderController.js   - Added cancelOrder function
✅ backend/routes/orderRoutes.js            - Added cancel order route
```

---

## 🚀 How to Run

### Step 1: Start Backend Server
```bash
cd backend
npm install
npm start
```
✅ Backend runs on: http://localhost:5000

### Step 2: Start Frontend Server (in new terminal)
```bash
cd frontend
npm install
npm start
```
✅ Frontend runs on: http://localhost:3000

---

## 🧪 Testing the System

### Test 1: User Order View ✅
1. Login as a regular user (role: "user")
2. Go to `/my-orders`
3. Click on an order
4. **You should see:**
   - Order details (clean view, NO GST/barcode)
   - Delivery timeline (Pending → Confirmed → Processing → Shipped → Delivered)
   - "Download Invoice", "Track Order", "Cancel Order" buttons
   - Cannot see admin controls

### Test 2: Admin Orders Management ✅
1. Login as admin (role: "admin")
2. Go to `/admin/orders`
3. **You should see:**
   - All customer orders
   - Search by order ID / customer name / email
   - Filter by order status
   - Click order to see full details
   - Full invoice with GST, barcode, PDF download
   - Update order status dropdown
   - Customer details & contact info

### Test 3: Order Cancellation ✅
1. Go to user order details
2. Click "Cancel Order" button (if order status is pending/confirmed/processing)
3. Confirm cancellation
4. **Result:** Order status changes to "cancelled", product stock restored

### Test 4: Security ✅
1. User tries to access another user's order by URL
2. **Result:** 403 Unauthorized error (cannot see other users' orders)
3. User tries to access `/admin/orders`
4. **Result:** Redirected to login or access denied

---

## 📊 API Endpoints

### User Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/orders/myorders | GET | Get user's orders |
| /api/orders/:id | GET | Get single order |
| /api/orders/:id/cancel | PUT | Cancel order |
| /api/orders/:id/invoice | GET | Download invoice |
| /api/orders/:id/barcode | GET | Get barcode image |

### Admin Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/orders | GET | Get all orders |
| /api/admin/orders | GET | List all orders |
| /api/admin/orders/:id/status | PUT | Update order status |
| /api/admin/stats | GET | Dashboard statistics |

---

## 🎨 User Interface

### Order Status Colors
- 🟨 **Pending**: FFB800 (Yellow)
- 🔵 **Confirmed**: 3B82F6 (Blue)
- 🟣 **Processing**: 8B5CF6 (Purple)
- 🟠 **Shipped**: F97316 (Orange)
- 🟢 **Delivered**: 10B981 (Green)
- 🔴 **Cancelled**: EF4444 (Red)

### Delivery Timeline Icons
- 📋 Order Placed
- ✓ Confirmed
- 📦 Processing
- 🚚 Shipped
- ✅ Delivered

---

## 🔒 Security Features

### Frontend Protection
✅ JWT token stored in localStorage  
✅ Protected routes redirect to login if not authenticated  
✅ Admin routes only accessible to admins  
✅ User cannot modify URL to view other users' orders  

### Backend Protection
✅ All routes require JWT token  
✅ Admin endpoints protected with adminOnly middleware  
✅ Order ownership validation: users can only see their own orders  
✅ Password hashing with bcryptjs  
✅ Role-based authorization (user/admin)  

---

## 📱 Features Summary

### User Features
| Feature | Status |
|---------|--------|
| View own orders | ✅ |
| Order timeline | ✅ |
| Download invoice | ✅ |
| Track order | ✅ |
| Cancel order | ✅ |
| View shipping address | ✅ |
| Payment status | ✅ |
| Delivery status | ✅ |

### Admin Features
| Feature | Status |
|---------|--------|
| View all orders | ✅ |
| Search orders | ✅ |
| Filter by status | ✅ |
| Update order status | ✅ |
| View invoice details | ✅ |
| Download invoice PDF | ✅ |
| View barcode | ✅ |
| View GST breakdown | ✅ |
| Customer contact info | ✅ |
| Order statistics | ✅ |

---

## 🛠 Troubleshooting

### Frontend Compilation Error
**Error:** `FiBarcode2 is not exported from react-icons/fi`  
**Solution:** ✅ Already fixed - using `FiBox` instead

### Backend Connection Error
**Error:** `Proxy error: Could not proxy request to localhost:5000`  
**Solution:** Make sure backend is running on port 5000

### 404 Order Not Found
**Cause:** Order ID is invalid or doesn't exist  
**Solution:** Use a valid order ID from the database

### 403 Unauthorized Error
**Cause:** Trying to access another user's order or admin route without admin role  
**Solution:** Login with correct user account or use admin account

---

## 📦 Project Structure

```
garmentx/
├── backend/
│   ├── controllers/
│   │   ├── orderController.js ✅
│   │   ├── invoiceController.js ✅
│   │   ├── adminController.js ✅
│   │   └── authController.js ✅
│   ├── models/
│   │   ├── Order.js ✅
│   │   ├── User.js ✅
│   │   ├── Product.js ✅
│   │   └── Review.js ✅
│   ├── middleware/
│   │   ├── auth.js ✅
│   │   └── authMiddleware.js ✅
│   ├── routes/
│   │   ├── orderRoutes.js ✅
│   │   ├── adminRoutes.js ✅
│   │   └── authRoutes.js ✅
│   └── server.js ✅
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── OrderDetailUser.js ✅
│   │   │   ├── AdminOrdersPage.js ✅
│   │   │   ├── AdminOrderDetail.js ✅
│   │   │   ├── MyOrders.js ✅
│   │   │   └── AdminPanel.js ✅
│   │   ├── components/
│   │   │   ├── InvoiceDetails.js ✅
│   │   │   ├── ProtectedRoute.js ✅
│   │   │   └── AdminRoute.js ✅
│   │   ├── context/
│   │   │   ├── AuthContext.js ✅
│   │   │   └── CartContext.js ✅
│   │   ├── utils/
│   │   │   └── api.js ✅
│   │   └── App.js ✅
│   └── package.json ✅
└── IMPLEMENTATION_COMPLETE.md ✅
```

---

## 🎓 Code Examples

### User Accessing Order
```javascript
// Only user can see their own order
GET /api/orders/:id
Authorization: Bearer <user_token>
Response: User's order details
```

### Admin Accessing Order
```javascript
// Admin can see any order
GET /api/orders/:id
Authorization: Bearer <admin_token>
Response: Full order details with GST, barcode, etc.
```

### Cancel Order
```javascript
// User cancels their own order
PUT /api/orders/:id/cancel
Authorization: Bearer <user_token>
Response: Order status = 'cancelled', stock restored
```

---

## ✨ Best Practices Implemented

✅ **Security First**
- JWT authentication on all protected routes
- Role-based access control
- Order ownership validation
- Password hashing

✅ **Clean Code**
- Modular component structure
- Reusable components
- Clear file organization
- Proper error handling

✅ **User Experience**
- Responsive mobile design
- Clear status indicators
- Toast notifications
- Loading spinners
- Intuitive UI

✅ **Performance**
- Efficient database queries
- Optimized React renders
- Lazy loading (optional)
- Caching (optional)

---

## 📞 Support

For any issues or questions:

1. Check the IMPLEMENTATION_COMPLETE.md file for detailed documentation
2. Review error messages in browser console
3. Check backend logs for API errors
4. Verify JWT token is valid
5. Ensure both frontend and backend are running

---

## 🎉 System is Ready for Production!

All security features, authorization, and features have been implemented and tested.

**Next Steps:**
1. Run backend: `npm start` in `/backend`
2. Run frontend: `npm start` in `/frontend`
3. Test the flows in the "Testing the System" section
4. Deploy to production when satisfied

---

**Built with ❤️ using React, Node.js, MongoDB, and best practices**
