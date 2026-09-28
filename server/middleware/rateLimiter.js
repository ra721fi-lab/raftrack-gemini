const rateLimit = require('express-rate-limit');

// Limiter untuk halaman login & register demi keamanan dari brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Maksimal 100 request login/register per 15 menit
  message: {
    success: false,
    message: 'Terlalu banyak percobaan masuk/daftar dari alamat IP ini. Silakan coba lagi nanti.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: false }
});

// Limiter umum untuk seluruh API (dashboard, filter transaksi, OCR, dll.)
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 menit
  max: 1000, // Maksimal 1000 request per 5 menit (sangat aman untuk dashboard realtime)
  message: {
    success: false,
    message: 'Terlalu banyak permintaan ke API. Harap kurangi frekuensi request Anda.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: false }
});

module.exports = {
  authLimiter,
  apiLimiter
};
