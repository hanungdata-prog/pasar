import { VercelRequest, VercelResponse } from '@vercel/node';
import Rating from '../models/Rating.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;

  try {
    if (method === 'GET') {
      const { productId } = query as any;

      if (!productId) {
        return res.status(400).json({ success: false, message: 'Product ID required' });
      }

      const stats = await Rating.aggregate([
        { $match: { product: productId } },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } }
      ]);

      const distribution: any = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      stats.forEach((s: any) => {
        distribution[s._id] = s.count;
      });

      const totalRatings = Object.values(distribution).reduce((a: number, b: number) => a + b, 0);
      const avgRating = totalRatings > 0
        ? Math.round(((5 * distribution[5] + 4 * distribution[4] + 3 * distribution[3] + 2 * distribution[2] + 1 * distribution[1]) / totalRatings) * 10) / 10
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          totalRatings,
          averageRating: avgRating,
          distribution
        }
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
