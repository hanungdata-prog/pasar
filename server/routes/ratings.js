import express from 'express';
import Rating from '../models/Rating.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import RateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50 // Lebih ketat untuk rating
});

router.use(limiter);

// GET /api/ratings - Get all ratings (with filters)
router.get('/', async (req, res) => {
  try {
    const { product, user, minRating, maxRating, limit = 50 } = req.query;
    
    let query = {};
    
    if (product) {
      query.product = product;
    }
    
    if (user) {
      query.user = user;
    }
    
    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = parseFloat(minRating);
      if (maxRating) query.rating.$lte = parseFloat(maxRating);
    }

    const ratings = await Rating.find(query)
      .populate('user', 'name')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({ success: true, data: ratings, total: ratings.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/ratings/product/:productId - Get ratings for a specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const { limit = 50, sort = 'newest' } = req.query;
    
    let sortOption = {};
    if (sort === 'highest') {
      sortOption = { rating: -1 };
    } else if (sort === 'lowest') {
      sortOption = { rating: 1 };
    } else if (sort === 'helpful') {
      sortOption = { helpful: -1 };
    } else {
      sortOption = { createdAt: -1 };
    }

    const ratings = await Rating.find({ product: req.params.productId })
      .populate('user', 'name deviceInfo')
      .sort(sortOption)
      .limit(parseInt(limit));
    
    res.json({ success: true, data: ratings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ratings - Create or update rating
router.post('/', async (req, res) => {
  try {
    const { userId, productId, deviceFingerprint, rating, comment } = req.body;

    if (!userId || !productId || !deviceFingerprint || !rating) {
      return res.status(400).json({
        success: false,
        message: 'User ID, Product ID, Device Fingerprint, dan Rating diperlukan'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating harus antara 1 sampai 5'
      });
    }

    // Cek apakah user sudah memberi rating pada produk ini
    let existingRating = await Rating.findOne({
      user: userId,
      product: productId
    });

    if (existingRating) {
      // Update rating yang sudah ada
      existingRating.rating = rating;
      if (comment) existingRating.comment = comment;
      existingRating.updatedAt = new Date();
      await existingRating.save();

      // Update average rating produk
      await updateProductRating(productId);

      return res.json({
        success: true,
        data: existingRating,
        message: 'Rating berhasil diupdate'
      });
    }

    // Buat rating baru
    const newRating = new Rating({
      user: userId,
      product: productId,
      deviceFingerprint,
      rating,
      comment
    });

    await newRating.save();

    // Populate data
    await newRating.populate('user', 'name');
    await newRating.populate('product', 'name');

    // Update user's ratingsGiven
    await User.findByIdAndUpdate(userId, {
      $push: { ratingsGiven: newRating._id },
      updatedAt: new Date()
    });

    // Update average rating produk
    await updateProductRating(productId);

    res.status(201).json({
      success: true,
      data: newRating,
      message: 'Rating berhasil ditambahkan'
    });
  } catch (error) {
    if (error.code === 11000) {
      // Handle race condition - try to update instead
      try {
        const existingRating = await Rating.findOneAndUpdate(
          { user: userId, product: productId },
          { rating, comment, updatedAt: new Date() },
          { new: true }
        );
        
        if (existingRating) {
          await updateProductRating(productId);
          return res.json({
            success: true,
            data: existingRating,
            message: 'Rating berhasil diupdate'
          });
        }
      } catch (updateError) {
        // Ignore update error, return original error
      }
      
      return res.status(400).json({
        success: false,
        message: 'Anda sudah memberi rating pada produk ini'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/ratings/:id - Update rating
router.put('/:id', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const updatedRating = await Rating.findByIdAndUpdate(
      req.params.id,
      { rating, comment, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('user', 'name').populate('product', 'name');

    if (!updatedRating) {
      return res.status(404).json({ success: false, message: 'Rating tidak ditemukan' });
    }

    // Update average rating produk
    await updateProductRating(updatedRating.product._id);

    res.json({ success: true, data: updatedRating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/ratings/:id - Delete rating
router.delete('/:id', async (req, res) => {
  try {
    const rating = await Rating.findByIdAndDelete(req.params.id);

    if (!rating) {
      return res.status(404).json({ success: false, message: 'Rating tidak ditemukan' });
    }

    // Remove from user's ratingsGiven
    await User.findByIdAndUpdate(rating.user, {
      $pull: { ratingsGiven: rating._id },
      updatedAt: new Date()
    });

    // Update average rating produk
    await updateProductRating(rating.product);

    res.json({ success: true, message: 'Rating berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/ratings/:id/helpful - Mark rating as helpful
router.put('/:id/helpful', async (req, res) => {
  try {
    const rating = await Rating.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true }
    ).populate('user', 'name').populate('product', 'name');

    if (!rating) {
      return res.status(404).json({ success: false, message: 'Rating tidak ditemukan' });
    }

    res.json({ success: true, data: rating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function untuk update average rating produk
async function updateProductRating(productId) {
  const stats = await Rating.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  const avgRating = stats[0]?.averageRating || 0;
  const totalRatings = stats[0]?.totalRatings || 0;

  await Product.findByIdAndUpdate(productId, {
    averageRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
    totalRatings,
    updatedAt: new Date()
  });
}

// GET /api/ratings/stats/:productId - Get rating statistics for a product
router.get('/stats/:productId', async (req, res) => {
  try {
    const stats = await Rating.aggregate([
      { $match: { product: req.params.productId } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    stats.forEach(s => {
      distribution[s._id] = s.count;
    });

    const totalRatings = Object.values(distribution).reduce((a, b) => a + b, 0);
    const avgRating = totalRatings > 0 
      ? Math.round(((5 * distribution[5] + 4 * distribution[4] + 3 * distribution[3] + 2 * distribution[2] + 1 * distribution[1]) / totalRatings) * 10) / 10
      : 0;

    res.json({ 
      success: true, 
      data: { 
        totalRatings, 
        averageRating: avgRating,
        distribution 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
