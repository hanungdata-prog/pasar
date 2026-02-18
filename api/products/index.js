import connectDB from '../lib/db.js';
import Product from '../models/Product.js';

export default async function handler(req, res) {
  const { method, query } = req;

  console.log('Products API - Method:', method, 'Query:', query);

  try {
    await connectDB();

    if (method === 'GET') {
      const { search, category, mainCategory, minRating, sort, limit = 200 } = query;

      let queryFilter = { isActive: true };

      if (search) {
        queryFilter.$text = { $search: search };
      }

      if (category) {
        queryFilter.category = category;
      }

      if (mainCategory) {
        queryFilter.mainCategory = mainCategory;
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

      console.log('Query filter:', JSON.stringify(queryFilter));
      const products = await Product.find(queryFilter)
        .sort(sortOption)
        .limit(parseInt(limit));

      console.log('Found', products.length, 'products');
      return res.status(200).json({ success: true, data: products, total: products.length });
    }

    if (method === 'POST') {
      const { name, description, category, mainCategory, price, image, images, whatsapp } = req.body;

      console.log('Creating product:', { name, category, whatsapp });

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
      console.log('Product created:', product._id);
      return res.status(201).json({ success: true, data: product });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Products API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
