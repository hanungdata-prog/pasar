import { VercelRequest, VercelResponse } from '@vercel/node';
import Product from '../models/Product.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  try {
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
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
