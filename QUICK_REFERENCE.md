# Quick Reference - Order System API & Routes

## 📍 Frontend Routes

```javascript
/                              // Home page
/my-orders                     // List user's orders (Protected)
/order/:id                     // View order details - USER VIEW (Protected)
/admin                         // Admin dashboard (Protected + Admin)
/admin/orders/:id             // View order details - ADMIN VIEW (Protected + Admin)
```

## 🔌 Backend API Endpoints

### User Order Endpoints
```
POST   /api/orders
       Request: { orderItems, shippingAddress, paymentMethod }
       Response: { success, order }
       Auth: Required (any user)

GET    /api/orders/myorders
       Response: { success, orders[] }
       Auth: Required (returns user's orders only)

GET    /api/orders/:id
       Response: { success, order }
       Auth: Required (user must own the order)
```

### Admin Order Endpoints
```
GET    /api/orders/admin/all
       Response: { success, orders[] }
       Auth: Required + Admin role

GET    /api/orders/admin/:id
       Response: { success, order }
       Auth: Required + Admin role
       
PUT    /api/orders/:id/status
       Request: { status: "pending|confirmed|processing|shipped|delivered|cancelled" }
       Response: { success, order }
       Auth: Required + Admin role
```

## 📦 Data Models

### User Order Response (GET /api/orders/myorders)
```javascript
{
  _id: ObjectId,
  orderNumber: "GX1234567890",
  status: "shipped",
  createdAt: "2024-05-26T...",
  totalPrice: 2999,
  isPaid: true,
  isDelivered: false,
  deliveredAt: null,
  orderItems: [
    {
      name: "Product Name",
      image: "url",
      price: 1000,
      quantity: 2,
      size: "M",
      color: "Red"
    }
  ],
  shippingAddress: {
    fullName: "...",
    street: "...",
    city: "...",
    state: "...",
    pincode: "...",
    phone: "..."
  }
}
```

### Admin Order Response (GET /api/orders/admin/:id)
```javascript
{
  // All user fields above, PLUS:
  
  itemsPrice: 2000,
  gstAmount: 360,
  deliveryCharges: 99,
  paymentMethod: "razorpay",
  paymentResult: {
    razorpay_order_id: "...",
    razorpay_payment_id: "...",
    razorpay_signature: "..."
  },
  user: {
    _id: ObjectId,
    name: "...",
    email: "...",
    phone: "..."
  },
  courierDetails: {
    provider: "...",
    trackingId: "...",
    awbNumber: "..."
  }
}
```

## 🔐 Authentication

### JWT Token Format
```
Header: {
  Authorization: "Bearer eyJhbGciOiJIUzI1NiIs..."
}
```

### Token Payload
```javascript
{
  id: user._id,
  email: user.email,
  role: "user" | "admin"  // Important for role checks
}
```

## 🛡️ Middleware Stack

```javascript
// For user routes
router.get('/orders/myorders', protect, getMyOrders);
//                             ↑
//                       Validates JWT & user exists

// For admin routes  
router.get('/orders/admin/all', protect, adminOnly, getAllOrders);
//                              ↑       ↑
//                        JWT check   Role check
```

## 📋 Common Request/Response Patterns

### Successful Response
```javascript
{
  success: true,
  message: "Optional message",
  order: { ... } | orders: [ ... ]
}
```

### Error Response
```javascript
{
  success: false,
  message: "Error description"
}

// Common HTTP Status Codes:
// 200 - OK
// 201 - Created
// 400 - Bad Request
// 401 - Unauthorized (no token)
// 403 - Forbidden (no admin role)
// 404 - Not Found
// 500 - Server Error
```

## 🧪 API Testing Examples

### Get My Orders (User)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/orders/myorders
```

### Get Order Detail (User)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/orders/ORDER_ID
```

### Get All Orders (Admin)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
     http://localhost:5000/api/orders/admin/all
```

### Get Order Detail (Admin)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
     http://localhost:5000/api/orders/admin/ORDER_ID
```

### Update Order Status (Admin)
```bash
curl -X PUT \
     -H "Authorization: Bearer ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"status":"shipped"}' \
     http://localhost:5000/api/orders/ORDER_ID/status
```

## 📱 Frontend API Usage

### Using orderAPI from utils/api.js

```javascript
import { orderAPI } from '../utils/api';

// Get user's orders
const { data } = await orderAPI.getMyOrders();
const orders = data.orders;

// Get single order detail
const { data } = await orderAPI.getById(orderId);
const order = data.order;

// Create order
const { data } = await orderAPI.create(orderData);

// Update order status (admin)
const { data } = await orderAPI.updateStatus(orderId, { status: 'shipped' });
```

### Using adminAPI from utils/api.js

```javascript
import { adminAPI } from '../utils/api';

// Get all orders
const { data } = await adminAPI.getAllOrders();
const orders = data.orders;

// Get order detail
const { data } = await adminAPI.getOrderDetail(orderId);
const order = data.order;

// Update order status
const { data } = await adminAPI.updateOrderStatus(orderId, { status: 'shipped' });
```

## ✅ Status Values

```javascript
// Valid order status values
const VALID_STATUSES = [
  'pending',      // Initial status
  'confirmed',    // Payment confirmed
  'processing',   // Being prepared
  'packed',       // Ready to ship
  'shipped',      // On the way
  'out_for_delivery',  // Final delivery
  'delivered',    // Received by customer
  'cancelled'     // Cancelled order
];
```

## 🔄 Component Flow

```
MyOrders Page
    ↓
    Uses: orderAPI.getMyOrders()
    ↓
    Renders: Multiple UserOrderCard components
    ↓
    Links to: /order/:id
    ↓
OrderDetailUser Page
    ↓
    Uses: orderAPI.getById(id)
    ↓
    Displays: Order detail with user-safe fields
    ↓
    Shows: Products, shipping, status
    ↓
    Hides: Invoice, GST, barcodes

Admin Order Operations
    ↓
    Uses: adminAPI.getAllOrders()
    ↓
    Displays: Order list
    ↓
    Clicks order → /admin/orders/:id
    ↓
AdminOrderDetail Page
    ↓
    Uses: adminAPI.getOrderDetail(id)
    ↓
    Displays: Complete order with invoice
    ↓
    Shows: Everything including admin controls
```

## 🚨 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | No token sent | Check JWT in localStorage |
| 403 Forbidden | Not admin role | Check user.role in database |
| 404 Not Found | Order doesn't exist | Verify order ID is correct |
| 400 Bad Request | Missing fields | Check request body |

## 📚 Documentation Files

- **ORDER_FIX_SUMMARY.md** - High-level overview
- **ORDER_SYSTEM_ARCHITECTURE.md** - Detailed architecture
- **IMPLEMENTATION_GUIDE.md** - Developer guide
- **BEFORE_AFTER_COMPARISON.md** - What changed and why
- **QUICK_REFERENCE.md** - This file

## 🎯 Key Principles

1. **Data Filtering**: Backend explicitly selects safe fields for users
2. **Role Separation**: Different endpoints for user vs admin
3. **Authorization**: Every admin action requires role verification
4. **Component Isolation**: User and admin components are separate
5. **Route Protection**: Frontend routes wrapped in ProtectedRoute

---

**Last Updated:** 2024-05-26  
**Version:** 1.0 (Production Ready)

