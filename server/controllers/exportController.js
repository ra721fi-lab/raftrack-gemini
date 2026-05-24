const TransactionModel = require('../models/transactionModel');

// @desc    Ekspor Semua Transaksi ke Format CSV (Excel Compatible)
// @route   GET /api/export/csv
// @access  Private
const exportCSV = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const transactions = await TransactionModel.getAll(user_id);

    // Header kolom untuk CSV
    let csvContent = 'ID Transaksi,Tanggal,Deskripsi,Kategori,Jenis,Nominal (IDR)\n';

    // Tambahkan data transaksi
    transactions.forEach(t => {
      // Escape koma pada deskripsi jika ada
      const cleanDesc = t.description ? t.description.replace(/"/g, '""') : '';
      csvContent += `${t.id},${t.date},"${cleanDesc}",${t.category_name},${t.type},${t.amount}\n`;
    });

    // Set header agar browser mengunduh sebagai file CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=raftrack_laporan_${new Date().toISOString().substring(0, 10)}.csv`);
    
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// @desc    Ambil Data Terstruktur untuk Laporan Cetak (Print)
// @route   GET /api/export/print
// @access  Private
const getPrintData = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const stats = await TransactionModel.getStats(user_id);
    const transactions = await TransactionModel.getAll(user_id);

    res.status(200).json({
      success: true,
      metadata: {
        username: req.user.username,
        email: req.user.email,
        generatedAt: new Date().toISOString(),
      },
      summary: {
        balance: stats.balance,
        totalIncome: stats.totalIncome,
        totalExpense: stats.totalExpense,
        expenseCategoryStats: stats.categoryBreakdown
      },
      transactions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportCSV,
  getPrintData
};
