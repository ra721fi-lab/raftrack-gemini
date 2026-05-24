const TransactionModel = require('../models/transactionModel');
const CategoryModel = require('../models/categoryModel');

// @desc    Buat Transaksi Baru
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    let { category_id, category_name, type, amount, description, date, receipt_img } = req.body;
    const user_id = req.user.id;

    if (!amount || !type || !date) {
      res.status(400);
      throw new Error('Harap lengkapi kolom jumlah (amount), jenis (type), dan tanggal (date)');
    }

    if (isNaN(amount) || amount <= 0) {
      res.status(400);
      throw new Error('Jumlah transaksi harus berupa angka positif yang valid');
    }

    // Resolusi otomatis kategori:
    // Jika frontend mengirim nama kategori (seperti 'makanan' dari voice/OCR) dan bukan category_id
    if (!category_id && category_name) {
      const resolvedCategory = await CategoryModel.findByName(category_name);
      if (resolvedCategory) {
        category_id = resolvedCategory.id;
      }
    }

    // Fallback jika category_id tetap kosong, cari/gunakan kategori 'lainnya'
    if (!category_id) {
      const otherCategory = await CategoryModel.findByName('lainnya');
      category_id = otherCategory ? otherCategory.id : 7; // Default id 7
    }

    // Validasi apakah kategori tersebut terdaftar
    const category = await CategoryModel.findById(category_id);
    if (!category) {
      res.status(400);
      throw new Error('Kategori tidak valid');
    }

    const transaction = await TransactionModel.create({
      user_id,
      category_id,
      type,
      amount,
      description: description || '',
      date,
      receipt_img: receipt_img || null
    });

    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil dicatat',
      transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dapatkan Semua Transaksi (dengan opsi Filter & Pencarian)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { search, category_id, type, startDate, endDate } = req.query;

    const transactions = await TransactionModel.getAll(user_id, {
      search,
      category_id,
      type,
      startDate,
      endDate
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dapatkan Detail Transaksi Tunggal
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await TransactionModel.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaksi tidak ditemukan');
    }

    // Pastikan transaksi milik user yang terautentikasi
    if (transaction.user_id !== req.user.id) {
      res.status(403);
      throw new Error('Akses ditolak: Anda tidak memiliki akses ke transaksi ini');
    }

    res.status(200).json({
      success: true,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ubah Data Transaksi
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    const { category_id, category_name, type, amount, description, date, receipt_img } = req.body;
    const transactionId = req.params.id;

    let transaction = await TransactionModel.findById(transactionId);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaksi tidak ditemukan');
    }

    if (transaction.user_id !== req.user.id) {
      res.status(403);
      throw new Error('Akses ditolak: Anda tidak berwenang mengubah transaksi ini');
    }

    // Resolusi otomatis kategori jika dikirim nama kategori
    let finalCategoryId = category_id;
    if (!finalCategoryId && category_name) {
      const resolvedCategory = await CategoryModel.findByName(category_name);
      if (resolvedCategory) {
        finalCategoryId = resolvedCategory.id;
      }
    }

    // Jika tidak ada category_id yang diberikan, gunakan yang lama
    if (!finalCategoryId) {
      finalCategoryId = transaction.category_id;
    }

    const updatedTransaction = await TransactionModel.update(transactionId, {
      category_id: finalCategoryId,
      type: type || transaction.type,
      amount: amount || transaction.amount,
      description: description !== undefined ? description : transaction.description,
      date: date || transaction.date,
      receipt_img: receipt_img !== undefined ? receipt_img : transaction.receipt_img
    });

    res.status(200).json({
      success: true,
      message: 'Transaksi berhasil diperbarui',
      transaction: updatedTransaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hapus Transaksi
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await TransactionModel.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaksi tidak ditemukan');
    }

    if (transaction.user_id !== req.user.id) {
      res.status(403);
      throw new Error('Akses ditolak: Anda tidak memiliki akses untuk menghapus transaksi ini');
    }

    await TransactionModel.delete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Transaksi berhasil dihapus'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction
};
