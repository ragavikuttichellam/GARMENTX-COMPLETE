const express = require('express');
const router = express.Router();
const reviewCtrl = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/multerMemory');

// POST /api/reviews/add - add new review (with images)
router.post('/add', protect, upload.array('images', 5), reviewCtrl.addReview);

// GET /api/reviews/product/:id - list reviews for product
router.get('/product/:id', reviewCtrl.getReviewsByProduct);

// PUT /api/reviews/update/:id - update review (owner or admin)
router.put('/update/:id', protect, upload.array('images', 5), reviewCtrl.updateReview);

// DELETE /api/reviews/delete/:id - delete review
router.delete('/delete/:id', protect, reviewCtrl.deleteReview);

// GET /api/reviews/average/:productId - get average rating
router.get('/average/:productId', reviewCtrl.getAverage);

// Admin routes
router.get('/admin/all', protect, adminOnly, reviewCtrl.adminList);
router.post('/:id/helpful', protect, reviewCtrl.helpful);
router.post('/:id/report', protect, reviewCtrl.report);

module.exports = router;
