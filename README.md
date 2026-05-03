# 🛍️ GarmentX — Full-Stack E-Commerce Platform

> A production-ready MERN Stack garment e-commerce website with Razorpay payment integration, JWT authentication, Admin Panel, and complete Indian GST billing.

![GarmentX Banner](https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏠 **Hero Section** | Animated hero with fashion banner, CTA buttons, stats |
| 🧭 **Navbar** | Logo, nav links, search, cart counter, user menu |
| 👗 **Collections** | Men / Women / Kids category browsing |
| 🛒 **Shop Page** | Filters, sorting, pagination, product grid |
| 📦 **Product Detail** | Size/color selector, add-to-cart, buy-now |
| 🛍️ **Cart Page** | Quantity controls, GST (18%), delivery charges, grand total |
| 💳 **Razorpay Payment** | Full payment gateway with signature verification |
| 📋 **Order Management** | Order history, status tracking |
| 🔒 **JWT Auth** | Login, register, protected routes |
| 🛠️ **Admin Panel** | Add/edit/delete products, manage orders & users |
| 📱 **Responsive** | Mobile-first design for all screen sizes |
| 🔍 **SEO Optimized** | Meta tags, OG tags, structured data |

---

## 🗂️ Project Structure

```
garmentx/
├── backend/                    # Node.js + Express API
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, Profile
│   │   ├── productController.js # CRUD + Reviews
│   │   ├── orderController.js  # Create, Track, Update Orders
│   │   ├── paymentController.js # Razorpay Integration
│   │   └── adminController.js  # Admin Dashboard
│   ├── middleware/
│   │   └── auth.js             # JWT protect + adminOnly
│   ├── models/
│   │   ├── User.js             # User Schema + bcrypt
│   │   ├── Product.js          # Product Schema + reviews
│   │   └── Order.js            # Order Schema + GST
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── adminRoutes.js
│   ├── uploads/                # Product images (if using multer)
│   ├── seedData.js             # Sample data + admin user
│   ├── server.js               # Entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/                   # React.js Application
    ├── public/
    │   └── index.html          # Razorpay script, SEO meta tags
    └── src/
        ├── components/
        │   ├── Navbar/
        │   │   ├── Navbar.js
        │   │   └── Navbar.css
        │   ├── Footer/
        │   │   └── Footer.js
        │   ├── ProductCard/
        │   │   ├── ProductCard.js
        │   │   └── ProductCard.css
        │   ├── ProtectedRoute.js
        │   └── AdminRoute.js
        ├── context/
        │   ├── CartContext.js   # Cart state + localStorage
        │   └── AuthContext.js  # Auth state + axios defaults
        ├── pages/
        │   ├── Home.js          # Hero + Collections + Featured
        │   ├── Shop.js          # Product grid + filters
        │   ├── ProductDetail.js # Size/color/cart
        │   ├── CartPage.js      # GST + delivery + checkout
        │   ├── Checkout.js      # Address form + Razorpay
        │   ├── OrderSuccess.js  # Confirmation page
        │   ├── MyOrders.js      # Order history
        │   ├── Login.js
        │   ├── Register.js
        │   ├── AdminPanel.js    # Full admin CRUD
        │   └── Contact.js
        ├── utils/
        │   └── api.js           # Axios instance + interceptors
        ├── App.js               # Router + providers
        ├── App.css
        └── index.css            # CSS variables + global styles
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Razorpay account (test keys from dashboard.razorpay.com)

### 1. Clone / Setup Backend

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your values:
# MONGODB_URI=mongodb://localhost:27017/garmentx
# JWT_SECRET=your_secret_here
# RAZORPAY_KEY_ID=rzp_test_xxxx
# RAZORPAY_KEY_SECRET=xxxx
```

### 2. Seed Database

```bash
npm run seed
# Creates 12 sample products + admin user:
# Email: admin@garmentx.com
# Password: Admin@123
```

### 3. Start Backend

```bash
npm run dev
# Runs on http://localhost:5000
```

### 4. Setup Frontend

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

---

## 💳 Razorpay Integration

The payment flow works as follows:

```
Customer clicks "Pay" 
  → Backend creates Order in MongoDB
  → Backend creates Razorpay Order (amount in paise)
  → Frontend opens Razorpay Checkout modal
  → Customer pays (test card: 4111 1111 1111 1111)
  → Razorpay calls handler with payment_id, signature
  → Frontend sends to Backend /api/payment/verify
  → Backend verifies HMAC SHA256 signature
  → Backend marks order as PAID
  → Frontend navigates to /order-success/:id
```

**Test Razorpay Cards:**
| Card | Number | CVV | Expiry |
|---|---|---|---|
| Visa Success | 4111 1111 1111 1111 | Any | Any future |
| Mastercard | 5267 3181 8797 5449 | Any | Any future |

---

## 🔐 API Endpoints

### Auth
```
POST /api/auth/register    - Register user
POST /api/auth/login       - Login user
GET  /api/auth/profile     - Get profile (protected)
PUT  /api/auth/profile     - Update profile (protected)
```

### Products
```
GET  /api/products                    - Get all (filters: category, search, sort, page)
GET  /api/products/:id                - Get single
POST /api/products                    - Create (admin)
PUT  /api/products/:id                - Update (admin)
DELETE /api/products/:id              - Delete (admin)
POST /api/products/:id/review         - Add review (user)
```

### Orders
```
POST /api/orders                      - Create order (user)
GET  /api/orders/myorders             - My orders (user)
GET  /api/orders/:id                  - Get order (user)
PUT  /api/orders/:id/status           - Update status (admin)
```

### Payment
```
GET  /api/payment/key                 - Get Razorpay key
POST /api/payment/razorpay            - Create Razorpay order
POST /api/payment/verify              - Verify payment signature
```

### Admin
```
GET  /api/admin/stats                 - Dashboard stats
GET  /api/admin/orders                - All orders
GET  /api/admin/users                 - All users
```

---

## 💰 GST & Pricing Logic

```javascript
// Indian GST calculation (18%)
const itemsPrice = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
const gstAmount = itemsPrice * 0.18;                    // 18% GST
const deliveryCharges = itemsPrice > 999 ? 0 : 99;      // Free above ₹999
const grandTotal = itemsPrice + gstAmount + deliveryCharges;
```

---

## 🔧 Environment Variables

### Backend `.env`
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/garmentx
JWT_SECRET=your_super_secure_secret
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_test_XXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXX
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (optional `.env`)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🛡️ Security Features

- ✅ Helmet.js (HTTP security headers)
- ✅ CORS with whitelist
- ✅ Rate limiting (200 req/15min)
- ✅ JWT authentication
- ✅ Password hashing with bcryptjs (salt 12)
- ✅ Razorpay signature verification (HMAC SHA256)
- ✅ Protected admin routes
- ✅ Input validation
- ✅ MongoDB injection prevention via Mongoose

---

## 🚢 Deployment

### Backend — Render / Railway / Heroku
```bash
# Set environment variables in dashboard
# Start command: node server.js
```

### Frontend — Vercel / Netlify
```bash
npm run build
# Deploy /build folder
# Add REACT_APP_API_URL=https://your-api.render.com/api
```

### MongoDB — MongoDB Atlas
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/garmentx
```

---

## 📸 Screens

| Page | Description |
|---|---|
| `/` | Hero + Collections + Featured + New Arrivals |
| `/shop` | Product grid with filters |
| `/men`, `/women`, `/kids` | Category pages |
| `/product/:id` | Product detail with size/color |
| `/cart` | Cart with GST calculation |
| `/checkout` | Address + Razorpay payment |
| `/order-success/:id` | Order confirmation |
| `/my-orders` | Order history |
| `/login`, `/register` | Auth pages |
| `/admin` | Admin dashboard (admin only) |
| `/contact` | Contact form |

---

## 🤝 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Context API |
| **Styling** | CSS Variables, Custom CSS, Google Fonts |
| **State** | Context API + useReducer + localStorage |
| **HTTP** | Axios with interceptors |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Payment** | Razorpay (HMAC SHA256 verification) |
| **Security** | Helmet, CORS, Rate Limit |
| **Icons** | react-icons (Feather) |
| **Toasts** | react-hot-toast |

---

## 📄 License

MIT License — Build freely, ship confidently.

---

*Built with ❤️ for Indian e-commerce entrepreneurs*
#   G A R M E N T X - C O M P L E T E  
 