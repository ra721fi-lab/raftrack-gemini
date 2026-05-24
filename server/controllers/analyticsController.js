const TransactionModel = require('../models/transactionModel');
const CategoryModel = require('../models/categoryModel');

// Helper untuk format rupiah
const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

// @desc    Dapatkan Ringkasan Statistik AI & Insight Keuangan
// @route   GET /api/analytics/stats
// @access  Private
const getAnalyticsStats = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const stats = await TransactionModel.getStats(user_id);
    const transactions = await TransactionModel.getAll(user_id);

    // ========================================================
    // ENGINE INSIGHT AI SEDERHANA
    // ========================================================
    let insightAlerts = [];
    let savingTips = [];
    let predictions = {
      predictedExpense: 0,
      confidence: 'LOW'
    };

    if (transactions.length > 0) {
      // 1. Cari kategori pengeluaran terbesar
      const highestExpense = stats.categoryBreakdown[0];
      if (highestExpense && highestExpense.value > 0) {
        insightAlerts.push({
          type: 'INFO',
          message: `Pengeluaran terbesar Anda dialokasikan pada kategori **${highestExpense.name.toUpperCase()}** dengan total ${formatRupiah(highestExpense.value)}.`
        });

        // 2. Berikan saran penghematan khusus berdasarkan kategori terbesar
        if (highestExpense.name === 'makanan') {
          savingTips.push('Cobalah untuk mengurangi makan di restoran mewah dan beralih ke memasak di rumah untuk menghemat hingga 30% pengeluaran makanan.');
        } else if (highestExpense.name === 'hiburan') {
          savingTips.push('Pengeluaran hiburan Anda cukup tinggi. Batasi langganan streaming bulanan atau cari alternatif hiburan gratis.');
        } else if (highestExpense.name === 'tagihan') {
          savingTips.push('Matikan peralatan listrik yang tidak terpakai dan tinjau kembali paket langganan internet untuk menghemat tagihan bulanan.');
        } else {
          savingTips.push(`Tinjau kembali alokasi pengeluaran untuk kategori ${highestExpense.name} agar dana cadangan lebih aman.`);
        }
      }

      // 3. Notifikasi Pengeluaran Berlebihan (Overspending Alert)
      const expenseRatio = stats.totalIncome > 0 ? (stats.totalExpense / stats.totalIncome) * 100 : 100;
      if (expenseRatio >= 80) {
        insightAlerts.push({
          type: 'WARNING',
          message: `Awas! Rasio pengeluaran Anda sudah mencapai **${expenseRatio.toFixed(1)}%** dari pemasukan. Anda berpotensi defisit bulan ini.`
        });
      } else if (expenseRatio >= 50) {
        insightAlerts.push({
          type: 'ATTENTION',
          message: `Pengeluaran Anda berada di zona aman-sedang (**${expenseRatio.toFixed(1)}%** dari pemasukan). Disarankan untuk menabung lebih banyak.`
        });
      } else {
        insightAlerts.push({
          type: 'SUCCESS',
          message: 'Luar biasa! Pengeluaran Anda terkendali dengan sangat baik (di bawah 50% pemasukan).'
        });
      }

      // 4. Prediksi pengeluaran bulan depan (berdasarkan tren transaksi)
      const expenses = transactions.filter(t => t.type === 'pengeluaran');
      if (expenses.length > 0) {
        const totalExp = expenses.reduce((acc, t) => acc + t.amount, 0);
        // Rata-rata pengeluaran transaksi dikalikan bobot sederhana
        predictions.predictedExpense = (totalExp / expenses.length) * 10; // Prediksi kasar
        predictions.confidence = expenses.length > 5 ? 'HIGH' : 'MEDIUM';
      }
    } else {
      insightAlerts.push({
        type: 'INFO',
        message: 'Belum ada transaksi tercatat. Mulai catat pemasukan dan pengeluaran Anda untuk melihat analisis AI.'
      });
      savingTips.push('Mulailah menyisihkan minimal 20% pemasukan untuk tabungan darurat.');
    }

    // Default tips
    savingTips.push('Gunakan metode penganggaran 50/30/20: 50% Kebutuhan Pokok, 30% Keinginan, 20% Tabungan/Investasi.');
    savingTips.push('Catat setiap pengeluaran kecil, karena akumulasi nominal kecil sering kali menjadi kebocoran anggaran.');

    res.status(200).json({
      success: true,
      stats: {
        ...stats,
        insights: insightAlerts,
        savingTips,
        predictions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Asisten Chatbot Pintar Keuangan (AI Fintech Agent)
// @route   POST /api/analytics/chatbot
// @access  Private
const handleAIChatbot = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { message } = req.body;

    if (!message) {
      res.status(400);
      throw new Error('Harap masukkan pesan chat');
    }

    const stats = await TransactionModel.getStats(user_id);
    const transactions = await TransactionModel.getAll(user_id);
    const prompt = message.toLowerCase();
    let reply = '';

    // ========================================================
    // LOGIC NLP CHATBOT PINTAR (INDONESIAN PARSER)
    // ========================================================
    if (prompt.includes('makanan') || prompt.includes('makan') || prompt.includes('kuliner')) {
      const foodExp = stats.categoryBreakdown.find(c => c.name === 'makanan');
      if (foodExp && foodExp.value > 0) {
        const percent = stats.totalExpense > 0 ? ((foodExp.value / stats.totalExpense) * 100).toFixed(1) : 0;
        reply = `Berdasarkan catatan keuangan Anda, total pengeluaran untuk **Makanan** bulan ini adalah **${formatRupiah(foodExp.value)}** (${percent}% dari seluruh pengeluaran Anda). Cobalah membawa bekal makan siang untuk menghemat lebih banyak!`;
      } else {
        reply = 'Anda belum mencatat pengeluaran untuk kategori makanan pada periode ini. Bagus sekali, atau mungkin Anda lupa mencatatnya?';
      }
    } 
    else if (prompt.includes('boros') || prompt.includes('saran') || prompt.includes('hemat') || prompt.includes('tips')) {
      const highest = stats.categoryBreakdown[0];
      if (highest && highest.value > 0) {
        reply = `Untuk meningkatkan tabungan Anda, AI menyarankan untuk membatasi pengeluaran di kategori terbesar Anda, yaitu **${highest.name.toUpperCase()}** (${formatRupiah(highest.value)}). Selain itu, terapkan aturan **50/30/20** agar finansial Anda tetap sehat dan seimbang.`;
      } else {
        reply = 'AI menyarankan Anda untuk memulai pencatatan harian secara disiplin. Alokasikan 20% pemasukan langsung ke pos tabungan atau investasi sebelum membelanjakan pos lainnya.';
      }
    }
    else if (prompt.includes('prediksi') || prompt.includes('masa depan') || prompt.includes('depan')) {
      if (transactions.length > 0) {
        const avgExpense = stats.totalExpense > 0 ? stats.totalExpense : 500000;
        const predicted = avgExpense * 1.05; // Asumsi inflasi atau kenaikan tren 5%
        reply = `Berdasarkan pola historis pengeluaran Anda saat ini, AI memprediksi pengeluaran Anda untuk bulan depan berkisar **${formatRupiah(predicted)}**. Rekomendasi: Tekan pengeluaran hiburan dan non-pokok agar berada di bawah prediksi ini.`;
      } else {
        reply = 'AI belum memiliki data transaksi yang cukup untuk melakukan prediksi. Silakan catat setidaknya 3 transaksi pengeluaran terlebih dahulu.';
      }
    }
    else if (prompt.includes('saldo') || prompt.includes('uang') || prompt.includes('total') || prompt.includes('pemasukan') || prompt.includes('pengeluaran')) {
      reply = `Berikut adalah ringkasan keuangan real-time Anda saat ini:
- **Total Saldo**: ${formatRupiah(stats.balance)}
- **Total Pemasukan**: ${formatRupiah(stats.totalIncome)}
- **Total Pengeluaran**: ${formatRupiah(stats.totalExpense)}

Apakah ada kategori tertentu yang ingin Anda analisis lebih dalam?`;
    }
    else if (prompt.includes('halo') || prompt.includes('hai') || prompt.includes('pagi') || prompt.includes('siang') || prompt.includes('sore') || prompt.includes('malam')) {
      reply = `Halo! Saya adalah **Asisten AI RafTrack Gemini**. 🌌 

Saya siap membantu menganalisis pola keuangan Anda, memprediksi pengeluaran, memberikan saran penghematan, hingga membantu Anda mencatat transaksi baru secara otomatis. 

Cobalah bertanya seperti:
- *"Berapa saldo saya saat ini?"*
- *"Apakah saya boros bulan ini?"*
- *"Berapa total pengeluaran makanan saya?"*`;
    }
    else {
      reply = `Pesan Anda diterima dengan baik oleh sistem AI. Saat ini saldo Anda adalah **${formatRupiah(stats.balance)}** dengan total pengeluaran **${formatRupiah(stats.totalExpense)}**. 

Untuk memaksimalkan kesehatan finansial Anda, AI merekomendasikan Anda menjaga alokasi dana darurat tetap terisi dan menghindari pembelian impulsif minggu ini.`;
    }

    res.status(200).json({
      success: true,
      reply
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalyticsStats,
  handleAIChatbot
};
