import connectDB from '../lib/db.js';
import Product from '../models/Product.js';

export default async function handler(req, res) {
  const { method, query } = req;

  try {
    await connectDB();

    if (method === 'GET') {
      const { search, category, minRating, sort, limit = 200 } = query;

      let queryFilter = { isActive: true };

      if (search) {
        queryFilter.$text = { $search: search };
      }

      if (category) {
        queryFilter.category = category;
      }

      if (minRating) {
        queryFilter.averageRating = { $gte: parseFloat(minRating) };
      }

      let sortOption = {};
      if (sort === 'rating') {
        sortOption = { averageRating: -1 };
      } else if (sort === 'newest') {
        sortOption = { createdAt: -1 };
      } else if (sort === 'price_asc') {
        sortOption = { price: 1 };
      } else if (sort === 'price_desc') {
        sortOption = { price: -1 };
      } else {
        sortOption = { createdAt: -1 };
      }

      const products = await Product.find(queryFilter)
        .sort(sortOption)
        .limit(parseInt(limit));

      return res.status(200).json({ success: true, data: products, total: products.length });
    }

    if (method === 'POST') {
      const { name, description, category, mainCategory, price, image, images, whatsapp } = req.body;

      const product = new Product({
        name,
        description,
        category,
        mainCategory,
        price,
        image,
        images: images || [image],
        whatsapp
      });

      await product.save();
      return res.status(201).json({ success: true, data: product });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
