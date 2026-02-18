import connectDB from '../lib/db.js';
import User from '../models/User.js';

export default async function handler(req, res) {
  const { method } = req;

  try {
    await connectDB();

    if (method === 'GET') {
      const users = await User.find().select('-deviceFingerprint').limit(50);
      return res.status(200).json({ success: true, data: users });
    }

    if (method === 'POST') {
      const { deviceFingerprint, whatsapp, name, deviceInfo } = req.body;

      if (!deviceFingerprint || !whatsapp) {
        return res.status(400).json({
          success: false,
          message: 'Device fingerprint dan WhatsApp diperlukan'
        });
      }

      let user = await User.findOne({ deviceFingerprint });

      if (user) {
        if (whatsapp !== user.whatsapp) {
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

        return res.status(200).json({
          success: true,
          data: user,
          message: 'Login berhasil'
        });
      }

      const existingWhatsapp = await User.findOne({ whatsapp });
      if (existingWhatsapp) {
        return res.status(400).json({
          success: false,
          message: 'Nomor WhatsApp sudah terdaftar. Gunakan device yang sama atau nomor lain.'
        });
      }

      user = new User({
        deviceFingerprint,
        whatsapp,
        name: name || 'User',
        deviceInfo
      });

      await user.save();

      return res.status(201).json({
        success: true,
        data: user,
        message: 'Registrasi berhasil'
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Device atau WhatsApp sudah terdaftar'
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}
