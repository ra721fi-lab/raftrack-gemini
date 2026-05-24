const rateLimit = require('express-rate-limit');

// Limiter untuk halaman login & register demi keamanan dari brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 50, // Batasi masing-masing IP maksimal 50 kali request per 15 menit
  message: {
    success: false,
    message: 'Terlalu banyak percobaan masuk/daftar dari alamat IP ini. Silakan coba lagi setelah 15 menit.'
  },
  standardHeaders: true, // Kembalikan info rate limit di header `RateLimit-*`
  legacyHeaders: false, // Matikan header `X-RateLimit-*`
});

// Limiter umum untuk seluruh API
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 menit
  max: 500, // Maksimal 500 request per 5 menit
  message: {
    success: false,
    message: 'Terlalu banyak permintaan ke API. Harap kurangi frekuensi request Anda.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  apiLimiter
};
