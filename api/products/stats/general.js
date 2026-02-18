import connectDB from '../lib/db.js';
import Product from '../models/Product.js';

export default async function handler(req, res) {
  const { method } = req;

  try {
    await connectDB();

    if (method === 'GET') {
      const totalProducts = await Product.countDocuments({ isActive: true });
      const avgRating = await Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, avgRating: { $avg: '$averageRating' } } }
      ]);

      return res.status(200).json({
        success: true,
        data: {
          totalProducts,
          averageRating: avgRating[0]?.avgRating || 0
        }
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
