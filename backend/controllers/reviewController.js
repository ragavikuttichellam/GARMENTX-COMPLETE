const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const cloudinary = require('../config/cloudinary');

const sentimentAnalysis = (text = '') => {
  const lower = text.toLowerCase();
  const positiveKeywords = ['excellent', 'great', 'perfect', 'best', 'love', 'amazing', 'fantastic', 'recommend', 'awesome', 'happy'];
  const negativeKeywords = ['bad', 'terrible', 'worst', 'poor', 'disappointed', 'refund', 'broken', 'hate', 'slow', 'problem'];
  let score = 0;
  positiveKeywords.forEach(word => { if (lower.includes(word)) score += 1; });
  negativeKeywords.forEach(word => { if (lower.includes(word)) score -= 1; });
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
};

const updateProductStats = async (productId) => {
  const agg = await Review.aggregate([
    { $match: { productId: mongoose.Types.ObjectId(productId), status: 'published' } },
    { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  const stats = agg[0] || { avgRating: 0, count: 0 };
  await Product.findByIdAndUpdate(productId, { rating: stats.avgRating || 0, numReviews: stats.count || 0 });
};

// helper to upload buffers to Cloudinary
const uploadBuffer = (buffer, folder = 'Manisara World/reviews') => new Promise((resolve, reject) => {
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
    const review = await Review.create({
      userId,
      productId,
      rating: r,
      comment,
      sentiment: sentimentAnalysis(comment),
      images,
      verifiedPurchase
    });

    await updateProductStats(review.productId);
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

    const query = { productId, status: 'published' };
    const [reviews, total] = await Promise.all([
      Review.find(query).populate('userId', 'name avatar').sort(sortQuery).skip(skip).limit(Number(limit)),
      Review.countDocuments(query)
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
    if (comment !== undefined) {
      review.comment = comment;
      review.sentiment = sentimentAnalysis(comment);
    }

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

    review.sentiment = sentimentAnalysis(review.comment);
    await review.save();
    await updateProductStats(review.productId);
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
    await updateProductStats(review.productId);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAverage = async (req, res) => {
  try {
    const productId = req.params.productId;
    const agg = await Review.aggregate([
      { $match: { productId: require('mongoose').Types.ObjectId(productId), status: 'published' } },
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

exports.adminAnalytics = async (req, res) => {
  try {
    const [stats, reported, topProducts] = await Promise.all([
      Review.aggregate([
        { $match: {} },
        { $group: {
          _id: null,
          total: { $sum: 1 },
          published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
          removed: { $sum: { $cond: [{ $eq: ['$status', 'removed'] }, 1, 0] } },
          avgRating: { $avg: '$rating' }
        } }
      ]),
      Review.countDocuments({ reports: { $exists: true, $not: { $size: 0 } } }),
      Review.aggregate([
        { $match: {} },
        { $group: { _id: '$productId', reports: { $sum: { $size: '$reports' } }, reviews: { $sum: 1 } } },
        { $sort: { reports: -1, reviews: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        { $project: { productName: '$product.name', reports: 1, reviews: 1 } }
      ])
    ]);
    const summary = stats[0] || { total: 0, published: 0, removed: 0, avgRating: 0 };
    res.json({ success: true, analytics: { totalReviews: summary.total, published: summary.published, removed: summary.removed, avgRating: summary.avgRating || 0, reportedReviews: reported, topReportedProducts: topProducts } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.replyReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Reply text is required' });
    review.adminReply = {
      text,
      adminId: req.user._id,
      createdAt: new Date()
    };
    await review.save();
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.moderateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    const status = req.body.status;
    if (!['published', 'pending', 'removed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    review.status = status;
    await review.save();
    await updateProductStats(review.productId);
    res.json({ success: true, review });
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
