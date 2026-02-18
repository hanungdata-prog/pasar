import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not defined');
  throw new Error('MONGODB_URI is required');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log('✅ Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔌 Connecting to MongoDB...');
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        return mongoose;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

const RatingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 500 },
  deviceFingerprint: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  helpful: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Rating = mongoose.models.Rating || mongoose.model('Rating', RatingSchema);

export default async function handler(req, res) {
  const { method, query } = req;
  const productId = query?.productId;

  console.log('📊 Ratings Stats API - Method:', method, 'ProductID:', productId);

  try {
    await connectDB();

    if (method !== 'GET') {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID required' });
    }

    const stats = await Rating.aggregate([
      { $match: { product: productId } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    console.log('📈 Raw stats:', JSON.stringify(stats));

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    stats.forEach((s) => {
      if (distribution.hasOwnProperty(s._id)) {
        distribution[s._id] = s.count;
      }
    });

    const totalRatings = Object.values(distribution).reduce((a, b) => a + b, 0);
    const avgRating = totalRatings > 0
      ? Math.round(((5 * distribution[5] + 4 * distribution[4] + 3 * distribution[3] + 2 * distribution[2] + 1 * distribution[1]) / totalRatings) * 10) / 10
      : 0;

    console.log('📊 Distribution:', distribution, '| Total:', totalRatings, '| Avg:', avgRating);

    return res.status(200).json({
      success: true,
      data: { totalRatings, averageRating: avgRating, distribution }
    });
  } catch (error) {
    console.error('❌ Ratings stats error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error'
    });
  }
}
