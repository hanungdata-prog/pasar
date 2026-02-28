import express from 'express';
import pool from '../config/db.js';
import RateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter untuk mencegah abuse
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100 // limit setiap IP ke 100 requests per windowMs
});

router.use(limiter);

// GET /api/users - Get all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id AS _id, whatsapp, name, device_info AS "deviceInfo", created_at AS "createdAt" FROM users ORDER BY created_at DESC LIMIT 50');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/users/register-or-login - Register or login user dengan device fingerprint
router.post('/register-or-login', async (req, res) => {
  try {
    const { deviceFingerprint, whatsapp, name, deviceInfo } = req.body;

    if (!deviceFingerprint || !whatsapp) {
      return res.status(400).json({
        success: false,
        message: 'Device fingerprint dan WhatsApp diperlukan'
      });
    }

    // Pertama, cari pengguna berdasarkan nomor WhatsApp (Primary ID)
    const existingUserResult = await pool.query('SELECT * FROM users WHERE whatsapp = $1', [whatsapp]);
    let user = existingUserResult.rows[0];

    if (user) {
      // User dengan WhatsApp ini sudah ada -> Ini adalah proses LOGIN
      // Update data device dan nama
      const updateResult = await pool.query(
        `UPDATE users
         SET device_fingerprint = $1, name = COALESCE($2, name), device_info = COALESCE($3, device_info), updated_at = NOW()
         WHERE id = $4
         RETURNING id AS _id, device_fingerprint AS "deviceFingerprint", whatsapp, name, device_info AS "deviceInfo", created_at AS "createdAt", updated_at AS "updatedAt"`,
        [deviceFingerprint, name, deviceInfo ? JSON.stringify(deviceInfo) : null, user.id]
      );

      return res.json({
        success: true,
        data: updateResult.rows[0],
        message: 'Login berhasil'
      });
    }

    // Jika WhatsApp belum terdaftar, ini adalah pendaftaran pengguna (REGISTER) baru
    const insertResult = await pool.query(
      `INSERT INTO users (device_fingerprint, whatsapp, name, device_info)
       VALUES ($1, $2, $3, $4)
       RETURNING id AS _id, device_fingerprint AS "deviceFingerprint", whatsapp, name, device_info AS "deviceInfo", created_at AS "createdAt", updated_at AS "updatedAt"`,
      [deviceFingerprint, whatsapp, name || 'User', deviceInfo ? JSON.stringify(deviceInfo) : null]
    );

    res.status(201).json({
      success: true,
      data: insertResult.rows[0],
      message: 'Registrasi berhasil'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT id AS _id, whatsapp, name, device_info AS "deviceInfo", created_at AS "createdAt" FROM users WHERE id = $1', [req.params.id]);
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/device/:fingerprint - Get user by device fingerprint
router.get('/device/:fingerprint', async (req, res) => {
  try {
    const result = await pool.query('SELECT id AS _id, whatsapp, name, device_info AS "deviceInfo", created_at AS "createdAt" FROM users WHERE device_fingerprint = $1', [req.params.fingerprint]);
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ success: false, message: 'Device tidak ditemukan' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const { whatsapp, name, deviceInfo } = req.body;

    // Cek duplikasi whatsapp jika diubah
    if (whatsapp) {
      const existingResult = await pool.query('SELECT id AS _id FROM users WHERE whatsapp = $1 AND id != $2', [whatsapp, req.params.id]);
      if (existingResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Nomor WhatsApp sudah digunakan'
        });
      }
    }

    const updateResult = await pool.query(
      `UPDATE users
       SET whatsapp = COALESCE($1, whatsapp), name = COALESCE($2, name), device_info = COALESCE($3, device_info), updated_at = NOW()
       WHERE id = $4
       RETURNING id AS _id, device_fingerprint AS "deviceFingerprint", whatsapp, name, device_info AS "deviceInfo", created_at AS "createdAt", updated_at AS "updatedAt"`,
      [whatsapp, name, deviceInfo ? JSON.stringify(deviceInfo) : null, req.params.id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    res.json({ success: true, data: updateResult.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
