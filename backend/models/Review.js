const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String },
  public_id: { type: String }
}, { _id: false });

const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: String
}, { timestamps: true, _id: false });

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  images: [imageSchema],
  verifiedPurchase: { type: Boolean, default: false },
  helpfulCount: { type: Number, default: 0 },
  reports: [reportSchema],
  status: { type: String, enum: ['published', 'pending', 'removed'], default: 'published' },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
  adminReply: {
    text: String,
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
