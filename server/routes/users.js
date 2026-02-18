import express from 'express';
import User from '../models/User.js';
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
    const users = await User.find().select('-deviceFingerprint').limit(50);
    res.json({ success: true, data: users });
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

    // Cek apakah device sudah terdaftar
    let user = await User.findOne({ deviceFingerprint });

    if (user) {
      // Device sudah terdaftar, update data jika ada perubahan
      if (whatsapp !== user.whatsapp) {
        // Cek apakah whatsapp sudah digunakan device lain
        const existingWhatsapp = await User.findOne({ whatsapp });
        if (existingWhatsapp) {
          return res.status(400).json({ 
            success: false, 
            message: 'Nomor WhatsApp sudah digunakan oleh device lain' 
          });
        }
        user.whatsapp = whatsapp;
      }
      if (name) user.name = name;
      if (deviceInfo) user.deviceInfo = { ...user.deviceInfo, ...deviceInfo };
      user.updatedAt = new Date();
      await user.save();
      
      return res.json({ 
        success: true, 
        data: user,
        message: 'Login berhasil' 
      });
    }

    // Device baru, cek apakah whatsapp sudah ada
    const existingWhatsapp = await User.findOne({ whatsapp });
    if (existingWhatsapp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nomor WhatsApp sudah terdaftar. Gunakan device yang sama atau nomor lain.' 
      });
    }

    // Buat user baru
    user = new User({
      deviceFingerprint,
      whatsapp,
      name: name || 'User',
      deviceInfo
    });

    await user.save();

    res.status(201).json({ 
      success: true, 
      data: user,
      message: 'Registrasi berhasil' 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Device atau WhatsApp sudah terdaftar' 
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-deviceFingerprint');
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
    const user = await User.findOne({ deviceFingerprint: req.params.fingerprint })
      .select('-deviceFingerprint');
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
      const existing = await User.findOne({ whatsapp, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ 
          success: false, 
          message: 'Nomor WhatsApp sudah digunakan' 
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { whatsapp, name, deviceInfo, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-deviceFingerprint');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
