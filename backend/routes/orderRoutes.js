const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getMyOrders, 
  getOrder, 
  cancelOrder,
  getAllOrders, 
  getAdminOrderDetail,
  updateOrderStatus 
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

// ─── USER ROUTES ───────────────────────────────────────────────────────────
router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);

// ─── ADMIN ROUTES ──────────────────────────────────────────────────────────
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.get('/admin/:id', protect, adminOnly, getAdminOrderDetail);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.get('/:id', protect, getOrder);

module.exports = router;
