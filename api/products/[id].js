import { VercelRequest, VercelResponse } from '@vercel/node';
import Product from '../models/Product.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;

  try {
    if (method === 'GET') {
      const { id } = query;

      if (id) {
        const product = await Product.findById(id);
        if (!product) {
          return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
        }
        return res.status(200).json({ success: true, data: product });
      }

      // Get all products for stats
      const products = await Product.find({ isActive: true });
      return res.status(200).json({ success: true, data: products });
    }

    if (method === 'PUT') {
      const { id } = query;
      const { name, description, category, mainCategory, price, image, images, isActive } = req.body;

      const product = await Product.findByIdAndUpdate(
        id as string,
        { name, description, category, mainCategory, price, image, images, isActive, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
      }

      return res.status(200).json({ success: true, data: product });
    }

    if (method === 'DELETE') {
      const { id } = query;

      const product = await Product.findByIdAndUpdate(
        id as string,
        { isActive: false, updatedAt: new Date() },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
      }

      return res.status(200).json({ success: true, message: 'Produk berhasil dihapus' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
