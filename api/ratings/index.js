import connectDB from '../lib/db.js';
import Rating from '../models/Rating.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

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
    averageRating: Math.round(avgRating * 10) / 10,
    totalRatings,
    updatedAt: new Date()
  });
}

export default async function handler(req, res) {
  const { method, query, body } = req;

  try {
    await connectDB();

    if (method === 'GET') {
      const { product, user, minRating, maxRating, limit = 50 } = query;

      let queryFilter = {};

      if (product) {
        queryFilter.product = product;
      }

      if (user) {
        queryFilter.user = user;
      }

      if (minRating || maxRating) {
        queryFilter.rating = {};
        if (minRating) queryFilter.rating.$gte = parseFloat(minRating);
        if (maxRating) queryFilter.rating.$lte = parseFloat(maxRating);
      }

      const ratings = await Rating.find(queryFilter)
        .populate('user', 'name')
        .populate('product', 'name')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      return res.status(200).json({ success: true, data: ratings, total: ratings.length });
    }

    if (method === 'POST') {
      const { userId, productId, deviceFingerprint, rating, comment } = body;

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

      let existingRating = await Rating.findOne({
        user: userId,
        product: productId
      });

      if (existingRating) {
        existingRating.rating = rating;
        if (comment) existingRating.comment = comment;
        existingRating.updatedAt = new Date();
        await existingRating.save();

        await updateProductRating(productId);

        return res.status(200).json({
          success: true,
          data: existingRating,
          message: 'Rating berhasil diupdate'
        });
      }

      const newRating = new Rating({
        user: userId,
        product: productId,
        deviceFingerprint,
        rating,
        comment
      });

      await newRating.save();

      await newRating.populate('user', 'name');
      await newRating.populate('product', 'name');

      await User.findByIdAndUpdate(userId, {
        $push: { ratingsGiven: newRating._id },
        updatedAt: new Date()
      });

      await updateProductRating(productId);

      return res.status(201).json({
        success: true,
        data: newRating,
        message: 'Rating berhasil ditambahkan'
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Anda sudah memberi rating pada produk ini'
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}
