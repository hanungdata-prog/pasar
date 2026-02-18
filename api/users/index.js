import { VercelRequest, VercelResponse } from '@vercel/node';
import User from '../models/User.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  try {
    if (method === 'GET') {
      // Get all users
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

      // Cek apakah device sudah terdaftar
      let user = await User.findOne({ deviceFingerprint });

      if (user) {
        // Device sudah terdaftar, update data jika ada perubahan
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

      return res.status(201).json({
        success: true,
        data: user,
        message: 'Registrasi berhasil'
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Device atau WhatsApp sudah terdaftar'
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}
