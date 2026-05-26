const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const db = require('./config/db');
const { initializeDatabase } = require('./models/dbInit');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');

// Konfigurasi Variabel Lingkungan
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================================
// MIDDLEWARE KEAMANAN & REQUEST PARSING
// ========================================================
app.use(helmet()); // Mengamankan header HTTP
app.use(cors({
  origin: '*', // Membuka akses CORS agar React Frontend bisa berkomunikasi tanpa kendala
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parsing request body JSON & URL Encoded
app.use(express.json({ limit: '10mb' })); // Limit besar untuk mengunggah gambar struk (Base64)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Terapkan rate limiter umum ke seluruh request API
app.use('/api/', apiLimiter);

// Middleware Koneksi Database Pemalas (Lazy Database Connector - Penting untuk Vercel Serverless)
app.use(async (req, res, next) => {
  try {
    if (!db.getPool() && db.getDbType() === 'mysql') {
      console.log('[Serverless Connection Hook] Menghubungkan ulang ke database MySQL cloud...');
      await db.connectDB();
      await initializeDatabase();
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Endpoint Tes Koneksi API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RafTrack Gemini API Server berjalan optimal.',
    timestamp: new Date().toISOString(),
    dbType: db.getDbType()
  });
});

// ========================================================
// REGISTRASI RUTE API RESTFUL
// ========================================================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));

// ========================================================
// HANDLER ERROR GLOBAL
// ========================================================
app.use(errorHandler);

// ========================================================
// START SERVER & KONEKSI DATABASE
// ========================================================
const startServer = async () => {
  console.log('\n🌌 Memulai RafTrack Gemini Server...');
  
  // 1. Hubungkan ke Database (dengan MySQL & Fallback JSON Otomatis)
  await db.connectDB();

  // 2. Jalankan Auto-Migration (jika database MySQL aktif)
  await initializeDatabase();

  // 3. Jalankan Listener Server Express (Hanya jika tidak di Vercel Serverless)
  if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
      console.log(`🚀 Server aktif di port: ${PORT}`);
      console.log(`🌐 API Endpoint Kesehatan: http://localhost:${PORT}/api/health`);
      console.log('------------------------------------------------------------\n');
    });
  }
};

startServer();

module.exports = app;
