import express from 'express';
import Product from '../models/Product.js';
import RateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

router.use(limiter);

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const { search, category, minRating, sort, limit = 50 } = req.query;
    
    let query = { isActive: true };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (minRating) {
      query.averageRating = { $gte: parseFloat(minRating) };
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

    const products = await Product.find(query)
      .sort(sortOption)
      .limit(parseInt(limit));
    
    res.json({ success: true, data: products, total: products.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products - Create product
router.post('/', async (req, res) => {
  try {
    const { name, description, category, price, image, images, whatsapp } = req.body;
    console.log("Creating product with data:", { name, category, price, whatsapp, imagesCount: images?.length });

    const product = new Product({
      name,
      description,
      category,
      price,
      image,
      images: images || [image],
      whatsapp
    });

    await product.save();
    console.log("Product saved:", product);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req, res) => {
  try {
    const { name, description, category, price, image, images, isActive } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, category, price, image, images, isActive, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/products/:id - Soft delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    res.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/stats/general - Get general product stats
router.get('/stats/general', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const avgRating = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgRating: { $avg: '$averageRating' } } }
    ]);
    
    res.json({ 
      success: true, 
      data: { 
        totalProducts, 
        averageRating: avgRating[0]?.avgRating || 0 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
