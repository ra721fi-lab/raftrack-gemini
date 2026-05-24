const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');

// Generator Token JWT
const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'futuristic_raftrack_gemini_neon_glow_secret_key_2026', 
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

const TransactionModel = require('../models/transactionModel');

// Helper untuk men-seed data transaksi awal saat pendaftaran (Wow Factor!)
const seedUserTransactions = async (userId) => {
  try {
    const daysAgo = (days) => {
      const date = new Date();
      date.setDate(date.getDate() - days);
      return date.toISOString().substring(0, 10);
    };

    // Peta ID Kategori Default:
    // 1: makanan, 2: transportasi, 3: tagihan, 4: hiburan, 5: investasi, 6: gaji, 7: lainnya
    const seeds = [
      { amount: 15000000, type: 'pemasukan', category_id: 6, description: 'Gaji Pokok FinTech Analyst', date: daysAgo(25) },
      { amount: 88000, type: 'pengeluaran', category_id: 4, description: 'Ngopi Starbucks Caramel Macchiato', date: daysAgo(22) },
      { amount: 45000, type: 'pengeluaran', category_id: 1, description: 'Makan Bakso Urat Mas No', date: daysAgo(20) },
      { amount: 350000, type: 'pengeluaran', category_id: 3, description: 'Langganan Internet Biznet Wifi', date: daysAgo(18) },
      { amount: 28000, type: 'pengeluaran', category_id: 2, description: 'Perjalanan Ojek Online ke Kantor', date: daysAgo(16) },
      { amount: 2000000, type: 'pengeluaran', category_id: 5, description: 'Pembelian Reksa Dana Saham', date: daysAgo(14) },
      { amount: 3000000, type: 'pemasukan', category_id: 6, description: 'Bonus Insentif Proyek Gemini', date: daysAgo(12) },
      { amount: 186000, type: 'pengeluaran', category_id: 4, description: 'Langganan Netflix Premium Bulanan', date: daysAgo(10) },
      { amount: 120000, type: 'pengeluaran', category_id: 1, description: 'Makan Siang Bersama Klien Padang', date: daysAgo(7) },
      { amount: 64000, type: 'pengeluaran', category_id: 2, description: 'Kembali Kerja GrabCar Hujan Deras', date: daysAgo(4) },
      { amount: 150000, type: 'pengeluaran', category_id: 3, description: 'Pulsa & Kuota Data Telkomsel', date: daysAgo(2) },
      { amount: 95000, type: 'pengeluaran', category_id: 7, description: 'Laundry Bedcover & Sprei', date: daysAgo(1) }
    ];

    for (const seed of seeds) {
      await TransactionModel.create({
        user_id: userId,
        category_id: seed.category_id,
        type: seed.type,
        amount: seed.amount,
        description: seed.description,
        date: seed.date,
        receipt_img: null
      });
    }
    console.log(`[Auto Seeder] Berhasil memasukkan 12 transaksi riwayat awal untuk user ID ${userId}`);
  } catch (error) {
    console.error('[Auto Seeder] Gagal melakukan seeder transaksi awal:', error);
  }
};

// @desc    Mendaftar User Baru
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validasi input minimal
    if (!username || !email || !password) {
      res.status(400);
      throw new Error('Harap lengkapi semua kolom: username, email, dan password');
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error('Kata sandi harus minimal 6 karakter');
    }

    // Cek apakah username sudah terdaftar
    const usernameExists = await UserModel.findByUsername(username);
    if (usernameExists) {
      res.status(400);
      throw new Error('Username ini sudah terdaftar');
    }

    // Cek apakah email sudah terdaftar
    const emailExists = await UserModel.findByEmail(email);
    if (emailExists) {
      res.status(400);
      throw new Error('Alamat email ini sudah terdaftar');
    }

    // Hash kata sandi
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan ke database
    const newUser = await UserModel.create({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    // Seeding otomatis transaksi keuangan agar dashboard langsung tampil menawan!
    await seedUserTransactions(newUser.id);

    res.status(201).json({
      success: true,
      message: 'Akun berhasil dibuat!',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        token: generateToken(newUser.id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Masuk / Login User
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { identity, password } = req.body; // identity bisa username atau email

    if (!identity || !password) {
      res.status(400);
      throw new Error('Harap masukkan username/email dan kata sandi');
    }

    // Cari berdasarkan email atau username
    let user = null;
    if (identity.includes('@')) {
      user = await UserModel.findByEmail(identity.toLowerCase().trim());
    } else {
      user = await UserModel.findByUsername(identity.toLowerCase().trim());
    }

    if (!user) {
      res.status(401);
      throw new Error('Kredensial salah, akun tidak ditemukan');
    }

    // Bandingkan hash password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Kredensial salah, kata sandi tidak cocok');
    }

    res.status(200).json({
      success: true,
      message: `Selamat datang kembali, ${user.username}!`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user.id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dapatkan Profil User Aktif
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    // req.user disiapkan oleh authMiddleware.js
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
