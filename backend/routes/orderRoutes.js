const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getMyOrders, 
  getOrder, 
  getAllOrders, 
  getAdminOrderDetail,
  updateOrderStatus 
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

// ─── USER ROUTES ───────────────────────────────────────────────────────────
router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrder);

// ─── ADMIN ROUTES ──────────────────────────────────────────────────────────
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.get('/admin/:id', protect, adminOnly, getAdminOrderDetail);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
