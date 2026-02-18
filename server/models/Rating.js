import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  deviceFingerprint: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index untuk mencegah duplikasi rating user ke produk yang sama
ratingSchema.index({ user: 1, product: 1 }, { unique: true });
ratingSchema.index({ product: 1, rating: -1 });
ratingSchema.index({ createdAt: -1 });

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;
