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

