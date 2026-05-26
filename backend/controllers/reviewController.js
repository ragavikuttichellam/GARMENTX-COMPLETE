const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const cloudinary = require('../config/cloudinary');

// helper to upload buffers to Cloudinary
const uploadBuffer = (buffer, folder = 'garmentx/reviews') => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
    if (error) return reject(error);
    resolve(result);
  });
  stream.end(buffer);
});

exports.addReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, rating, comment } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'productId required' });
    const r = Number(rating);
    if (!r || r < 1 || r > 5) return res.status(400).json({ success: false, message: 'Invalid rating' });

    // verify purchase
    const purchased = await Order.findOne({ user: userId, 'orderItems.product': productId, isPaid: true });
    if (!purchased) return res.status(403).json({ success: false, message: 'Only customers who purchased can review' });

    // prevent duplicate
    const existing = await Review.findOne({ userId, productId });
    if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this product' });

    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadBuffer(file.buffer);
        images.push({ url: uploaded.secure_url, public_id: uploaded.public_id });
      }
    }

    const verifiedPurchase = !!purchased;
    const review = await Review.create({ userId, productId, rating: r, comment, images, verifiedPurchase });

    // update product aggregate (numReviews, rating)
    const agg = await Review.aggregate([
      { $match: { productId: review.productId } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const stats = agg[0] || { avgRating: 0, count: 0 };
    await Product.findByIdAndUpdate(review.productId, { rating: stats.avgRating, numReviews: stats.count });

    res.status(201).json({ success: true, review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReviewsByProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { page = 1, limit = 8, sort = 'latest' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    let sortQuery = { createdAt: -1 };
    if (sort === 'highest') sortQuery = { rating: -1 };
    if (sort === 'lowest') sortQuery = { rating: 1 };

    const [reviews, total] = await Promise.all([
      Review.find({ productId }).populate('userId', 'name avatar').sort(sortQuery).skip(skip).limit(Number(limit)),
      Review.countDocuments({ productId })
    ]);
    res.json({ success: true, reviews, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { rating, comment, removeImageIds } = req.body;
    if (rating) {
      const r = Number(rating);
      if (!r || r < 1 || r > 5) return res.status(400).json({ success: false, message: 'Invalid rating' });
      review.rating = r;
    }
    if (comment !== undefined) review.comment = comment;

    // remove images if requested
    if (removeImageIds && Array.isArray(removeImageIds)) {
      for (const pid of removeImageIds) {
        const idx = review.images.findIndex(i => i.public_id === pid);
        if (idx !== -1) {
          try { await cloudinary.uploader.destroy(pid); } catch (e) { /* ignore */ }
          review.images.splice(idx, 1);
        }
      }
    }

    // upload any new files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadBuffer(file.buffer);
        review.images.push({ url: uploaded.secure_url, public_id: uploaded.public_id });
      }
    }

    await review.save();

    // recompute product stats
    const agg = await Review.aggregate([
      { $match: { productId: review.productId } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const stats = agg[0] || { avgRating: 0, count: 0 };
    await Product.findByIdAndUpdate(review.productId, { rating: stats.avgRating, numReviews: stats.count });

    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // remove images from cloudinary
    for (const img of review.images) {
      try { await cloudinary.uploader.destroy(img.public_id); } catch (e) { /* ignore */ }
    }

    await review.remove();

    // recompute stats
    const agg = await Review.aggregate([
      { $match: { productId: review.productId } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const stats = agg[0] || { avgRating: 0, count: 0 };
    await Product.findByIdAndUpdate(review.productId, { rating: stats.avgRating || 0, numReviews: stats.count || 0 });

    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAverage = async (req, res) => {
  try {
    const productId = req.params.productId;
    const agg = await Review.aggregate([
      { $match: { productId: require('mongoose').Types.ObjectId(productId) } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 }, breakdown: { $push: '$rating' } } }
    ]);
    const data = agg[0] || { avgRating: 0, count: 0 };
    // build breakdown counts 1..5
    const breakdown = { 1:0,2:0,3:0,4:0,5:0 };
    if (data.breakdown) {
      data.breakdown.forEach(r => { breakdown[r] = (breakdown[r] || 0) + 1; });
    }
    res.json({ success: true, average: data.avgRating || 0, count: data.count || 0, breakdown });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin listing + analytics
exports.adminList = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find({}).populate('userId', 'name email').populate('productId', 'name').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Review.countDocuments()
    ]);
    res.json({ success: true, reviews, total, page: Number(page), pages: Math.ceil(total/Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// mark helpful
exports.helpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    review.helpfulCount = (review.helpfulCount || 0) + 1;
    await review.save();
    res.json({ success: true, helpfulCount: review.helpfulCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// report review
exports.report = async (req, res) => {
  try {
    const { reason } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    review.reports.push({ user: req.user._id, reason: reason || 'No reason provided' });
    await review.save();
    res.json({ success: true, message: 'Report submitted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
