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
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    }).then(m => m).catch(e => {
      console.error('MongoDB error:', e.message);
      cached.promise = null;
      throw e;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const RatingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 500 },
  deviceFingerprint: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Rating = mongoose.models.Rating || mongoose.model('Rating', RatingSchema);

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  try {
    await connectDB();

    // Get productId from path parameter (e.g., /api/ratings/stats/69960d3fbfa9b19a2c85b1df)
    const { productId } = req.query;
    console.log('📊 Stats request - ProductID:', productId, 'Query:', req.query);

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID required'
      });
    }
    
    const stats = await Rating.aggregate([
      { $match: { product: productId } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);
    
    console.log('📈 Raw stats:', stats);
    
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    stats.forEach(s => { 
      if(dist[s._id] !== undefined) dist[s._id] = s.count; 
    });
    
    const total = Object.values(dist).reduce((a,b) => a+b, 0);
    const avg = total > 0 ? Math.round(((5*dist[5] + 4*dist[4] + 3*dist[3] + 2*dist[2] + 1*dist[1]) / total) * 10) / 10 : 0;
    
    console.log('📊 Result - Total:', total, 'Avg:', avg);
    
    res.status(200).json({ 
      success: true, 
      data: { 
        totalRatings: total, 
        averageRating: avg, 
        distribution: dist 
      } 
    });
  } catch (e) {
    console.error('❌ Stats error:', e.message);
    res.status(500).json({ 
      success: false, 
      error: e.message 
    });
  }
}
