const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Dapatkan token dari header
      token = req.headers.authorization.split(' ')[1];

      // Verifikasi token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'futuristic_raftrack_gemini_neon_glow_secret_key_2026');

      // Ambil data user dari token
      const user = await UserModel.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ success: false, message: 'Pengguna tidak ditemukan atau token tidak valid' });
      }

      // Pasang object user ke request
      req.user = user;
      next();
    } catch (error) {
      console.error('[Auth Middleware] Error verifikasi token:', error);
      res.status(401).json({ success: false, message: 'Tidak terautentikasi, token tidak valid atau kadaluarsa' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Tidak terautentikasi, token tidak disediakan' });
  }
};

module.exports = { protect };
