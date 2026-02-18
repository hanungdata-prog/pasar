import connectDB from '../lib/db.js';
import User from '../models/User.js';

export default async function handler(req, res) {
  const { method, body } = req;

  console.log('Users API - Method:', method);

  try {
    await connectDB();

    if (method === 'GET') {
      const users = await User.find().select('-deviceFingerprint').limit(50);
      return res.status(200).json({ success: true, data: users });
    }

    if (method === 'POST') {
      const { deviceFingerprint, whatsapp, name, deviceInfo } = body;

      console.log('Login attempt:', { whatsapp, name, deviceFingerprint: deviceFingerprint?.substring(0, 10) + '...' });

      if (!deviceFingerprint || !whatsapp) {
        return res.status(400).json({
          success: false,
          message: 'Device fingerprint dan WhatsApp diperlukan'
        });
      }

      let user = await User.findOne({ deviceFingerprint });

      if (user) {
        console.log('Existing user found, updating...');
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

      console.log('New user, checking whatsapp...');
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
      console.log('New user created:', user._id);

      return res.status(201).json({
        success: true,
        data: user,
        message: 'Registrasi berhasil'
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Users API Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Device atau WhatsApp sudah terdaftar'
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
