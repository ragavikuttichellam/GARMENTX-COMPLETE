# 🔧 DEVELOPER GUIDE - API Documentation & Code Examples

## Authentication & Authorization

### JWT Implementation

**Token Generation (Backend):**
```javascript
// In authController.js
const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

**Token Validation (Frontend):**
```javascript
// In api.js interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('garmentx_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

### Role-Based Middleware

**User-Only Route:**
```javascript
// Protected route - users only
router.get('/myorders', protect, getMyOrders);

// protect middleware validates token
exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  next();
};
```

**Admin-Only Route:**
```javascript
// Admin protected route
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

// adminOnly middleware checks role
exports.adminOnly = (req, res, next) => {
  if (req.user.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
};
```

---

## Order Ownership Validation

**In Order Controller:**
```javascript
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    // SECURITY: Check ownership
    if (order.user.toString() !== req.user._id.toString()) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          message: 'Not authorized to view this order' 
        });
      }
    }
    
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
```

---

## API Endpoints with Examples

### 1. Get User's Orders

**Request:**
```
GET /api/orders/myorders
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "6547abc123def456",
      "orderNumber": "GX16847123456",
      "status": "pending",
      "totalPrice": 2999,
      "createdAt": "2024-05-22T10:30:00Z",
      "orderItems": [
        {
          "name": "Cotton T-Shirt",
          "image": "url",
          "quantity": 2,
          "price": 1499,
          "size": "M",
          "color": "Black"
        }
      ]
    }
  ]
}
```

### 2. Get Single Order

**Request (User):**
```
GET /api/orders/6547abc123def456
Authorization: Bearer <user_token>
```

**Request (Admin):**
```
GET /api/orders/6547abc123def456
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "order": {
    "_id": "6547abc123def456",
    "orderNumber": "GX16847123456",
    "status": "pending",
    "user": {
      "_id": "userId",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "orderItems": [
      {
        "name": "Cotton T-Shirt",
        "image": "url",
        "quantity": 2,
        "price": 1499,
        "size": "M",
        "color": "Black"
      }
    ],
    "shippingAddress": {
      "fullName": "John Doe",
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India",
      "phone": "9876543210"
    },
    "itemsPrice": 2998,
    "gstAmount": 539.64,
    "deliveryCharges": 99,
    "totalPrice": 3636.64,
    "isPaid": false,
    "isDelivered": false,
    "paymentMethod": "razorpay"
  }
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Not authorized to view this order"
}
```

### 3. Get All Orders (Admin Only)

**Request:**
```
GET /api/orders
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "6547abc123def456",
      "orderNumber": "GX16847123456",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "status": "pending",
      "totalPrice": 3636.64,
      "orderItems": [...]
    }
  ]
}
```

### 4. Update Order Status (Admin Only)

**Request:**
```
PUT /api/orders/6547abc123def456/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "shipped"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order status updated!",
  "order": {
    "_id": "6547abc123def456",
    "status": "shipped",
    "updatedAt": "2024-05-22T11:00:00Z"
  }
}
```

### 5. Cancel Order (User)

**Request:**
```
PUT /api/orders/6547abc123def456/cancel
Authorization: Bearer <user_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "order": {
    "_id": "6547abc123def456",
    "status": "cancelled"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Cannot cancel order with status: shipped"
}
```

### 6. Download Invoice

**Request:**
```
GET /api/orders/6547abc123def456/invoice
Authorization: Bearer <token>
```

**Response:** PDF file (binary)

### 7. Get Barcode

**Request:**
```
GET /api/orders/6547abc123def456/barcode
Authorization: Bearer <token>
```

**Response:** PNG image (binary)

### 8. Get Admin Statistics

**Request:**
```
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalProducts": 150,
    "totalOrders": 250,
    "totalUsers": 500,
    "totalRevenue": 750000
  }
}
```

---

## Frontend Integration Examples

### Using Order API

**Get User Orders:**
```javascript
// In OrderDetailUser.js
import { orderAPI } from '../utils/api';

useEffect(() => {
  orderAPI
    .getById(id)
    .then(({ data }) => setOrder(data.order))
    .catch((err) => toast.error(err.response?.data?.message));
}, [id]);
```

**Cancel Order:**
```javascript
const handleCancelOrder = async () => {
  try {
    const { data } = await api.put(`/orders/${order._id}/cancel`);
    setOrder(data.order);
    toast.success('Order cancelled successfully');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to cancel order');
  }
};
```

**Download Invoice:**
```javascript
const handleDownloadInvoice = async () => {
  try {
    const res = await api.get(`/orders/${order._id}/invoice`, { 
      responseType: 'blob' 
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${order.orderNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
  } catch (err) {
    toast.error('Failed to download invoice');
  }
};
```

**Search Orders (Admin):**
```javascript
const filteredOrders = orders.filter((order) => {
  const matchesSearch =
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesStatus = !statusFilter || order.status === statusFilter;

  return matchesSearch && matchesStatus;
});
```

---

## Database Schema Reference

### Order Schema

```javascript
const orderSchema = new mongoose.Schema({
  // User who placed the order
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Order items
  orderItems: [{
    product: mongoose.Schema.Types.ObjectId,
    name: String,
    image: String,
    price: Number,
    quantity: { type: Number, required: true, min: 1 },
    size: String,
    color: String
  }],
  
  // Shipping information
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  
  // Payment details
  paymentMethod: { type: String, required: true, default: 'razorpay' },
  paymentResult: {
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
    status: String
  },
  
  // Pricing
  itemsPrice: { type: Number, required: true },
  gstAmount: { type: Number, required: true },
  deliveryCharges: { type: Number, required: true, default: 0 },
  totalPrice: { type: Number, required: true },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  isDelivered: { type: Boolean, default: false },
  deliveredAt: Date,
  
  // Tracking
  orderNumber: { type: String, unique: true },
  trackingId: String,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### User Schema

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  phone: { type: String },
  
  // Role-based access
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
```

---

## Error Handling

### Common HTTP Status Codes

| Code | Status | Example |
|------|--------|---------|
| 200 | OK | Successful request |
| 201 | Created | Order created successfully |
| 400 | Bad Request | Invalid data provided |
| 401 | Unauthorized | Invalid or expired token |
| 403 | Forbidden | User not authorized (role issue) |
| 404 | Not Found | Order/resource not found |
| 500 | Server Error | Database/server error |

### Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

### Frontend Error Handling

```javascript
try {
  const { data } = await orderAPI.getById(id);
  setOrder(data.order);
} catch (err) {
  // Handle specific error codes
  if (err.response?.status === 403) {
    // Unauthorized - redirect to login
    window.location.href = '/login';
  } else if (err.response?.status === 404) {
    // Not found
    toast.error('Order not found');
  } else {
    // Generic error
    toast.error(err.response?.data?.message || 'Error occurred');
  }
}
```

---

## Environment Variables

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/garmentx
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d
NODE_ENV=development

# Company Details
COMPANY_NAME=GarmentX Pvt Ltd
COMPANY_ADDRESS=123 Fashion Street, Mumbai
INVOICE_FOOTER=Thank you for shopping with GarmentX!
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Performance Optimization

### Database Indexes

```javascript
// In Order model
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
```

### API Pagination (Optional)

```javascript
// Get orders with pagination
router.get('/admin/orders', protect, adminOnly, async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;
  
  const orders = await Order.find({})
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  res.json({ success: true, orders, page, limit });
});
```

---

## Security Checklist

- ✅ All routes protected with JWT
- ✅ Admin routes use adminOnly middleware
- ✅ Order ownership validation implemented
- ✅ Password hashing with bcryptjs
- ✅ CORS configured
- ✅ Environment variables used for secrets
- ✅ Error messages don't leak sensitive info
- ✅ Rate limiting (optional)
- ✅ HTTPS in production (recommended)
- ✅ Input validation on all endpoints

---

## Testing Checklist

### User Flows
- [ ] User can login
- [ ] User can view own orders
- [ ] User can view order details
- [ ] User can download invoice
- [ ] User can track order
- [ ] User can cancel pending order
- [ ] User cannot cancel shipped order
- [ ] User cannot access admin routes

### Admin Flows
- [ ] Admin can login
- [ ] Admin can view all orders
- [ ] Admin can search orders
- [ ] Admin can filter by status
- [ ] Admin can update order status
- [ ] Admin can view full invoice
- [ ] Admin can view barcode
- [ ] Admin can access admin dashboard

### Security
- [ ] Invalid token redirects to login
- [ ] User cannot view other users' orders
- [ ] User cannot call admin endpoints
- [ ] Admin can view any order
- [ ] Stock restored on cancellation
- [ ] Password is hashed before storage

---

## Deployment Checklist

- [ ] Update environment variables
- [ ] Set JWT_SECRET to secure random string
- [ ] Set MONGODB_URI to production database
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure CORS for production domain
- [ ] Set up error logging
- [ ] Enable database backups
- [ ] Test all critical flows
- [ ] Monitor performance

---

**This guide provides all necessary information for developers to understand, maintain, and extend the order system.**
