import express from 'express';
import pool from '../config/db.js';
import RateLimit from 'express-rate-limit';
import { uploadBase64Image } from '../utils/r2.js';

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

    let queryValues = [];
    let queryConditions = ['is_active = TRUE'];

    if (search) {
      queryValues.push(`%${search}%`);
      queryConditions.push(`(name ILIKE $${queryValues.length} OR description ILIKE $${queryValues.length})`);
    }

    if (category) {
      queryValues.push(category);
      queryConditions.push(`category = $${queryValues.length}`);
    }

    if (minRating) {
      queryValues.push(parseFloat(minRating));
      queryConditions.push(`average_rating >= $${queryValues.length}`);
    }

    let sortSQL = 'created_at DESC';
    if (sort === 'rating') {
      sortSQL = 'average_rating DESC';
    } else if (sort === 'newest') {
      sortSQL = 'created_at DESC';
    } else if (sort === 'price_asc') {
      sortSQL = 'price ASC';
    } else if (sort === 'price_desc') {
      sortSQL = 'price DESC';
    }

    const whereClause = queryConditions.length > 0 ? `WHERE ${queryConditions.join(' AND ')}` : '';
    const sql = `
      SELECT id AS _id, name, description, category, main_category AS "mainCategory", 
             image, images, price, whatsapp, average_rating::FLOAT AS "averageRating", 
             total_ratings::INTEGER AS "totalRatings", is_active AS "isActive", 
             created_at AS "createdAt", updated_at AS "updatedAt"
      FROM products 
      ${whereClause} 
      ORDER BY ${sortSQL} 
      LIMIT ${parseInt(limit)}`;

    const result = await pool.query(sql, queryValues);

    res.json({ success: true, data: result.rows, total: result.rows.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const sql = `
      SELECT id AS _id, name, description, category, main_category AS "mainCategory", 
             image, images, price, whatsapp, average_rating::FLOAT AS "averageRating", 
             total_ratings::INTEGER AS "totalRatings", is_active AS "isActive", 
             created_at AS "createdAt", updated_at AS "updatedAt"
      FROM products 
      WHERE id = $1`;
    const result = await pool.query(sql, [req.params.id]);
    const product = result.rows[0];
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
    const { name, description, category, mainCategory, price, image, images, whatsapp } = req.body;

    let uploadedImage = image;
    if (image && image.startsWith('data:image/')) {
      uploadedImage = await uploadBase64Image(image);
    }

    let uploadedImages = images || [image];
    if (images && Array.isArray(images)) {
      uploadedImages = await Promise.all(
        images.map(img => typeof img === 'string' && img.startsWith('data:image/') ? uploadBase64Image(img) : img)
      );
    } else if (uploadedImage) {
      uploadedImages = [uploadedImage];
    } else {
      uploadedImages = [];
    }

    const insertResult = await pool.query(
      `INSERT INTO products (name, description, category, main_category, price, image, images, whatsapp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id AS _id, name, description, category, main_category AS "mainCategory", 
                 image, images, price, whatsapp, average_rating::FLOAT AS "averageRating", 
                 total_ratings::INTEGER AS "totalRatings", is_active AS "isActive", 
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [name, description, category, mainCategory, price, uploadedImage, JSON.stringify(uploadedImages), whatsapp]
    );

    res.status(201).json({ success: true, data: insertResult.rows[0] });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req, res) => {
  try {
    const { name, description, category, price, image, images, isActive } = req.body;

    let uploadedImage = image;
    if (image && image.startsWith('data:image/')) {
      uploadedImage = await uploadBase64Image(image);
    }

    let uploadedImages = images || [];
    if (images && Array.isArray(images)) {
      uploadedImages = await Promise.all(
        images.map(img => typeof img === 'string' && img.startsWith('data:image/') ? uploadBase64Image(img) : img)
      );
    }

    const updateResult = await pool.query(
      `UPDATE products 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           category = COALESCE($3, category), 
           price = COALESCE($4, price), 
           image = COALESCE($5, image), 
           images = COALESCE($6, images), 
           is_active = COALESCE($7, is_active), 
           updated_at = NOW()
       WHERE id = $8
       RETURNING id AS _id, name, description, category, main_category AS "mainCategory", 
                 image, images, price, whatsapp, average_rating::FLOAT AS "averageRating", 
                 total_ratings::INTEGER AS "totalRatings", is_active AS "isActive", 
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [name, description, category, price, uploadedImage, images ? JSON.stringify(uploadedImages) : null, isActive, req.params.id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    res.json({ success: true, data: updateResult.rows[0] });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/products/:id - Soft delete product
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE products SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING id AS _id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
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
    const statsResult = await pool.query(
      'SELECT COUNT(*) as total_products, AVG(average_rating) as average_rating FROM products WHERE is_active = TRUE'
    );

    res.json({
      success: true,
      data: {
        totalProducts: parseInt(statsResult.rows[0].total_products),
        averageRating: parseFloat(statsResult.rows[0].average_rating) || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
