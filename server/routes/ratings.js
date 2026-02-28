import express from 'express';
import pool from '../config/db.js';
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

    let queryValues = [];
    let queryConditions = [];

    if (product) {
      queryValues.push(product);
      queryConditions.push(`product_id = $${queryValues.length}`);
    }

    if (user) {
      queryValues.push(user);
      queryConditions.push(`user_id = $${queryValues.length}`);
    }

    if (minRating) {
      queryValues.push(parseFloat(minRating));
      queryConditions.push(`rating >= $${queryValues.length}`);
    }

    if (maxRating) {
      queryValues.push(parseFloat(maxRating));
      queryConditions.push(`rating <= $${queryValues.length}`);
    }

    const whereClause = queryConditions.length > 0 ? `WHERE ${queryConditions.join(' AND ')}` : '';
    const sql = `
      SELECT r.id AS _id, r.user_id AS "userId", r.product_id AS "productId", 
             r.rating, r.comment, r.helpful, r.device_fingerprint AS "deviceFingerprint",
             r.created_at AS "createdAt", r.updated_at AS "updatedAt",
             u.name as user_name, p.name as product_name 
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN products p ON r.product_id = p.id
      ${whereClause} 
      ORDER BY r.created_at DESC 
      LIMIT ${parseInt(limit)}`;

    const result = await pool.query(sql, queryValues);

    const formattedData = result.rows.map(row => ({
      ...row,
      user: { _id: row.userId, name: row.user_name },
      product: { _id: row.productId, name: row.product_name }
    }));

    res.json({ success: true, data: formattedData, total: formattedData.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/ratings/product/:productId - Get ratings for a specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const { limit = 50, sort = 'newest' } = req.query;

    let sortSQL = 'r.created_at DESC';
    if (sort === 'highest') {
      sortSQL = 'r.rating DESC';
    } else if (sort === 'lowest') {
      sortSQL = 'r.rating ASC';
    } else if (sort === 'helpful') {
      sortSQL = 'r.helpful DESC';
    }

    const sql = `
      SELECT r.id AS _id, r.user_id AS "userId", r.product_id AS "productId", 
             r.rating, r.comment, r.helpful, r.device_fingerprint AS "deviceFingerprint",
             r.created_at AS "createdAt", r.updated_at AS "updatedAt",
             u.name as user_name, u.device_info AS "deviceInfo"
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1
      ORDER BY ${sortSQL}
      LIMIT $2`;

    const result = await pool.query(sql, [req.params.productId, parseInt(limit)]);

    const formattedData = result.rows.map(row => ({
      ...row,
      user: { _id: row.userId, name: row.user_name, deviceInfo: row.deviceInfo }
    }));

    res.json({ success: true, data: formattedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ratings - Create or update rating
router.post('/', async (req, res) => {
  const { userId, productId, deviceFingerprint, rating, comment } = req.body;
  try {
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

    const result = await pool.query(
      `INSERT INTO ratings (user_id, product_id, device_fingerprint, rating, comment, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (user_id, product_id) DO UPDATE SET
          rating = EXCLUDED.rating,
          comment = EXCLUDED.comment,
          device_fingerprint = EXCLUDED.device_fingerprint,
          updated_at = NOW()
       RETURNING id AS _id, user_id AS "userId", product_id AS "productId", 
                 rating, comment, helpful, device_fingerprint AS "deviceFingerprint",
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [userId, productId, deviceFingerprint, rating, comment]
    );

    await updateProductRating(productId);
    res.json({ success: true, data: result.rows[0], message: 'Rating berhasil disimpan' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/ratings/:id - Update rating
router.put('/:id', async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const result = await pool.query(
      `UPDATE ratings 
       SET rating = COALESCE($1, rating), comment = COALESCE($2, comment), updated_at = NOW()
       WHERE id = $3
       RETURNING id AS _id, user_id AS "userId", product_id AS "productId", 
                 rating, comment, helpful, device_fingerprint AS "deviceFingerprint",
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [rating, comment, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Rating tidak ditemukan' });
    }

    await updateProductRating(result.rows[0].productId);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/ratings/:id - Delete rating
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM ratings WHERE id = $1 RETURNING product_id AS "productId"', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Rating tidak ditemukan' });
    }

    await updateProductRating(result.rows[0].productId);

    res.json({ success: true, message: 'Rating berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/ratings/:id/helpful - Mark rating as helpful
router.put('/:id/helpful', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE ratings SET helpful = helpful + 1 WHERE id = $1 RETURNING id AS _id, helpful',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Rating tidak ditemukan' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function untuk update average rating produk
async function updateProductRating(productId) {
  const statsResult = await pool.query(
    'SELECT COUNT(*) as count, AVG(rating) as avg FROM ratings WHERE product_id = $1',
    [productId]
  );

  const count = parseInt(statsResult.rows[0].count) || 0;
  const avg = parseFloat(statsResult.rows[0].avg) || 0;

  await pool.query(
    'UPDATE products SET average_rating = $1, total_ratings = $2, updated_at = NOW() WHERE id = $3',
    [Math.round(avg * 10) / 10, count, productId]
  );
}

// GET /api/ratings/stats/:productId - Get rating statistics for a product
router.get('/stats/:productId', async (req, res) => {
  try {
    const statsResult = await pool.query(
      'SELECT rating, COUNT(*) as count FROM ratings WHERE product_id = $1 GROUP BY rating',
      [req.params.productId]
    );

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    statsResult.rows.forEach(row => {
      distribution[row.rating] = parseInt(row.count);
    });

    const totalRatings = Object.values(distribution).reduce((a, b) => a + b, 0);
    const sumRatings = Object.entries(distribution).reduce((acc, [rating, count]) => acc + (parseInt(rating) * count), 0);
    const avgRating = totalRatings > 0 ? Math.round((sumRatings / totalRatings) * 10) / 10 : 0;

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
