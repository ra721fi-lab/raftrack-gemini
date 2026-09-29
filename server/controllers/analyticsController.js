const TransactionModel = require('../models/transactionModel');
const CategoryModel = require('../models/categoryModel');
const { GoogleGenerativeAI } = require('@google/generative-ai');


// Helper untuk format rupiah
const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

// Helper untuk format tanggal aman (mencegah crash objek Date di MySQL)
const formatDate = (dateVal) => {
  if (!dateVal) return 'n/a';
  try {
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? String(dateVal).substring(0, 10) : d.toISOString().substring(0, 10);
  } catch (err) {
    return String(dateVal).substring(0, 10);
  }
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

    // 1. Ambil data finansial kontekstual nyata dari database
    const stats = await TransactionModel.getStats(user_id);
    const transactions = await TransactionModel.getAll(user_id);
    const apiKey = process.env.GEMINI_API_KEY;
    let reply = '';

    // Siapkan daftar transaksi terbaru dalam bentuk ringkas untuk disuntikkan ke prompt
    const recentTransactions = transactions.slice(0, 10).map(t => ({
      date: formatDate(t.date),
      type: t.type,
      amount: t.amount,
      description: t.description || 'Tanpa deskripsi',
      category: t.category_name || 'Lainnya',
      payment_source: t.payment_source || 'cash'
    }));

    // ========================================================
    // MODEL UTAMA: GOOGLE GEMINI 1.5 FLASH (KUNCI API DIKETAHUI)
    // ========================================================
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Mempersiapkan System Prompt dengan data finansial pengguna
        const systemPrompt = `Anda adalah Asisten AI RafTrack Gemini (Gemini Fintech Agent) yang cerdas dan handal.
Tugas Anda adalah menjadi perencana keuangan pribadi yang membantu menganalisis pola pengeluaran, pemasukan, saldo, dan memberikan saran penghematan cerdas yang konkret kepada pengguna.

Berikut adalah DATA KEUANGAN REAL-TIME dari pengguna saat ini:
- Total Saldo Bersih: ${formatRupiah(stats.balance)}
- Saldo Bank: ${formatRupiah(stats.bankBalance)}
- Saldo E-Wallet: ${formatRupiah(stats.walletBalance)}
- Saldo Cash (Tunai): ${formatRupiah(stats.cashBalance)}
- Total Pemasukan: ${formatRupiah(stats.totalIncome)}
- Total Pengeluaran: ${formatRupiah(stats.totalExpense)}

Rincian Pengeluaran per Kategori:
${stats.categoryBreakdown.map(c => `- ${c.name.toUpperCase()}: ${formatRupiah(c.value)}`).join('\n') || '- Belum ada pengeluaran'}

10 Transaksi Terakhir Pengguna:
${recentTransactions.map((t, idx) => `${idx + 1}. [${t.date}] ${t.type.toUpperCase()} - ${formatRupiah(t.amount)} - ${t.description} (Kategori: ${t.category}, Rekening: ${t.payment_source.toUpperCase()})`).join('\n') || '- Belum ada riwayat transaksi'}

Aturan Penting Respon Anda:
1. Jawablah dalam Bahasa Indonesia yang ramah, profesional, ringkas, dan solutif.
2. Jawab secara SPESIFIK dan NYAMBUNG sesuai apa yang ditanyakan/diperintahkan pengguna. Hubungkan jawaban Anda dengan data keuangan nyata di atas jika relevan.
3. Selalu gunakan tanda bintang ganda (format bold markdown: **teks**) untuk menekankan angka nominal uang rupiah (contoh: **${formatRupiah(100000)}**), nama kategori (contoh: **makanan**), dan nama rekening (contoh: **Bank**, **Wallet**, **Cash**). Jangan gunakan format markdown lain selain bold biasa (karena parser frontend kami sangat sederhana dan hanya mendukung format **).
4. Jangan berikan respon yang terlalu panjang. Jaga agar jawaban padat, langsung menjawab inti pertanyaan, dan mudah dibaca di layar HP (maksimal 2-3 paragraf singkat atau list poin).`;

        const result = await model.generateContent({
          contents: [
            { role: 'user', parts: [{ text: `System Context:\n${systemPrompt}\n\nPertanyaan Pengguna: "${message}"` }] }
          ]
        });
        
        reply = result.response.text();
      } catch (geminiError) {
        console.error('[Gemini API Error, beralih ke Fallback NLP Engine]:', geminiError);
      }
    }

    // ========================================================
    // ENGINE CADANGAN: ADVANCED CONTEXT-AWARE INDONESIAN NLP
    // ========================================================
    if (!reply) {
      const prompt = message.toLowerCase();
      
      const getCategoryExpense = (catName) => {
        const cat = stats.categoryBreakdown.find(c => c.name.toLowerCase().includes(catName.toLowerCase()));
        return cat ? cat.value : 0;
      };

      // 1. QUERY TENTANG SALDO ATAU UANG
      if (prompt.includes('saldo') || prompt.includes('uang') || prompt.includes('duit') || prompt.includes('total') || prompt.includes('punya berapa') || prompt.includes('dompet') || prompt.includes('kas')) {
        if (prompt.includes('bank')) {
          reply = `Saat ini, saldo Anda di rekening **Bank** adalah **${formatRupiah(stats.bankBalance)}**.\n\nApakah ada transaksi di Bank yang ingin Anda periksa atau catat?`;
        } else if (prompt.includes('wallet') || prompt.includes('e-wallet') || prompt.includes('dompet digital')) {
          reply = `Saat ini, saldo Anda di **Wallet** (E-Wallet) adalah **${formatRupiah(stats.walletBalance)}**.\n\nSemua transaksi cashless tercatat dengan rapi di sini!`;
        } else if (prompt.includes('cash') || prompt.includes('tunai') || prompt.includes('pegang')) {
          reply = `Saat ini, sisa uang tunai (**Cash**) yang Anda pegang adalah **${formatRupiah(stats.cashBalance)}**.\n\nTetap catat pengeluaran tunai kecil agar tidak bocor alus, ya!`;
        } else {
          reply = `Berikut adalah ringkasan saldo keuangan riil Anda saat ini:
- **Total Saldo Bersih**: **${formatRupiah(stats.balance)}**
- Saldo di **Bank**: **${formatRupiah(stats.bankBalance)}**
- Saldo di **Wallet**: **${formatRupiah(stats.walletBalance)}**
- Uang Tunai (**Cash**): **${formatRupiah(stats.cashBalance)}**

Selain itu, total pemasukan Anda bulan ini adalah **${formatRupiah(stats.totalIncome)}** dengan total pengeluaran sebesar **${formatRupiah(stats.totalExpense)}**.`;
        }
      }
      // 2. QUERY TENTANG REKENING / SUMBER DANA
      else if (prompt.includes('rekening') || prompt.includes('bank') || prompt.includes('wallet') || prompt.includes('cash') || prompt.includes('sumber dana') || prompt.includes('simpan')) {
        reply = `Uang Anda saat ini tersebar di 3 rekening penyimpanan berikut:
1. 🏦 **Bank**: **${formatRupiah(stats.bankBalance)}**
2. 📱 **Wallet**: **${formatRupiah(stats.walletBalance)}**
3. 💵 **Cash**: **${formatRupiah(stats.cashBalance)}**

Total dana yang Anda miliki adalah **${formatRupiah(stats.balance)}**. Anda bisa memindahkan alokasi sumber dana saat mencatat atau mengubah transaksi di halaman Riwayat!`;
      }
      // 3. QUERY KATEGORI SPESIFIK DINAMIS (Mengcover Semua Kategori)
      else if (
        prompt.includes('makan') || prompt.includes('makanan') || prompt.includes('kuliner') || prompt.includes('restoran') || prompt.includes('jajan') || prompt.includes('kopi') ||
        prompt.includes('transport') || prompt.includes('transportasi') || prompt.includes('bensin') || prompt.includes('perjalanan') || prompt.includes('gojek') || prompt.includes('grab') || prompt.includes('kendaraan') || prompt.includes('mobil') || prompt.includes('motor') ||
        prompt.includes('tagihan') || prompt.includes('listrik') || prompt.includes('pln') || prompt.includes('internet') || prompt.includes('pulsa') || prompt.includes('air') || prompt.includes('pdam') || prompt.includes('wifi') || prompt.includes('telepon') ||
        prompt.includes('hiburan') || prompt.includes('game') || prompt.includes('nonton') || prompt.includes('bioskop') || prompt.includes('refreshing') || prompt.includes('rekreasi') || prompt.includes('wisata') || prompt.includes('jalan-jalan') ||
        prompt.includes('investasi') || prompt.includes('saham') || prompt.includes('reksadana') || prompt.includes('crypto') || prompt.includes('tabungan') || prompt.includes('emas') || prompt.includes('invest') ||
        prompt.includes('gaji') || prompt.includes('pemasukan') || prompt.includes('pendapatan') || prompt.includes('upah') ||
        prompt.includes('lainnya') || prompt.includes('lain-lain') || prompt.includes('lain')
      ) {
        let matchedCategory = '';
        if (prompt.includes('makan') || prompt.includes('makanan') || prompt.includes('kuliner') || prompt.includes('restoran') || prompt.includes('jajan') || prompt.includes('kopi')) {
          matchedCategory = 'makanan';
        } else if (prompt.includes('transport') || prompt.includes('transportasi') || prompt.includes('bensin') || prompt.includes('perjalanan') || prompt.includes('gojek') || prompt.includes('grab') || prompt.includes('kendaraan') || prompt.includes('mobil') || prompt.includes('motor')) {
          matchedCategory = 'transportasi';
        } else if (prompt.includes('tagihan') || prompt.includes('listrik') || prompt.includes('pln') || prompt.includes('internet') || prompt.includes('pulsa') || prompt.includes('air') || prompt.includes('pdam') || prompt.includes('wifi') || prompt.includes('telepon')) {
          matchedCategory = 'tagihan';
        } else if (prompt.includes('hiburan') || prompt.includes('game') || prompt.includes('nonton') || prompt.includes('bioskop') || prompt.includes('refreshing') || prompt.includes('rekreasi') || prompt.includes('wisata') || prompt.includes('jalan-jalan')) {
          matchedCategory = 'hiburan';
        } else if (prompt.includes('investasi') || prompt.includes('saham') || prompt.includes('reksadana') || prompt.includes('crypto') || prompt.includes('tabungan') || prompt.includes('emas') || prompt.includes('invest')) {
          matchedCategory = 'investasi';
        } else if (prompt.includes('gaji') || prompt.includes('pemasukan') || prompt.includes('pendapatan') || prompt.includes('upah')) {
          matchedCategory = 'gaji';
        } else {
          matchedCategory = 'lainnya';
        }

        if (matchedCategory === 'gaji') {
          reply = `Total pemasukan Anda dari kategori **GAJI** periode ini adalah **${formatRupiah(stats.totalIncome)}**.\n\nApakah ada pemasukan dari sumber lain yang ingin Anda catat atau tanyakan?`;
        } else {
          const catVal = getCategoryExpense(matchedCategory);
          if (catVal > 0) {
            const percent = stats.totalExpense > 0 ? ((catVal / stats.totalExpense) * 100).toFixed(1) : 0;
            reply = `Berdasarkan catatan sistem kami, total pengeluaran Anda untuk kategori **${matchedCategory.toUpperCase()}** bulan ini adalah **${formatRupiah(catVal)}**.\n\nIni menyumbang sekitar **${percent}%** dari keseluruhan total pengeluaran Anda.`;
          } else {
            reply = `Anda belum mencatat pengeluaran untuk kategori **${matchedCategory.toUpperCase()}** bulan ini. Kinerja penghematan pos anggaran yang luar biasa!`;
          }
        }
      }
      // 4. QUERY TENTANG KATEGORI PENGELUARAN SECARA UMUM ATAU BELANJA SPESIFIK
      else if (prompt.includes('belanja') || prompt.includes('pengeluaran') || prompt.includes('kategori') || prompt.includes('habis') || prompt.includes('beli')) {
        const highest = stats.categoryBreakdown[0];
        if (highest && highest.value > 0) {
          const percent = stats.totalExpense > 0 ? ((highest.value / stats.totalExpense) * 100).toFixed(1) : 0;
          reply = `Bulan ini, pengeluaran terbesar Anda dialokasikan pada kategori **${highest.name.toUpperCase()}** dengan total **${formatRupiah(highest.value)}** (sekitar **${percent}%** dari total pengeluaran Anda).\n\nBerikut 3 kategori teratas pengeluaran Anda:
${stats.categoryBreakdown.slice(0, 3).map((c, i) => `${i + 1}. **${c.name.toUpperCase()}**: **${formatRupiah(c.value)}**`).join('\n')}

Total seluruh pengeluaran tercatat Anda adalah **${formatRupiah(stats.totalExpense)}**.`;
        } else {
          reply = `Anda belum memiliki catatan pengeluaran bulan ini. Total pengeluaran Anda saat ini adalah **${formatRupiah(stats.totalExpense)}**. Mulai catat pengeluaran Anda dengan menekan tombol **Catat Manual** di sidebar kiri!`;
        }
      }
      // 5. QUERY TENTANG RIWAYAT / TRANSAKSI TERAKHIR
      else if (prompt.includes('transaksi') || prompt.includes('terakhir') || prompt.includes('terbaru') || prompt.includes('riwayat') || prompt.includes('catatan') || prompt.includes('daftar')) {
        if (transactions.length > 0) {
          const limit = Math.min(transactions.length, 5);
          const list = transactions.slice(0, limit).map((t, idx) => {
            const typeSign = t.type === 'pemasukan' ? '+' : '-';
            const srcText = t.payment_source ? `[${t.payment_source.toUpperCase()}]` : '[CASH]';
            return `${idx + 1}. **${t.description || 'Tanpa deskripsi'}** (${formatDate(t.date)}) -> **${typeSign}${formatRupiah(t.amount)}** ${srcText}`;
          }).join('\n');
          reply = `Berikut adalah **${limit} transaksi terbaru** yang berhasil saya temukan dari riwayat Anda:\n\n${list}\n\nSemua data ini tersinkronisasi secara real-time dengan database Anda!`;
        } else {
          reply = `Belum ada riwayat transaksi yang tercatat di akun Anda. Mulai catat pemasukan pertama Anda atau gunakan fitur **Scan Struk** untuk pencatatan otomatis berbasis AI OCR!`;
        }
      }
      // 6. QUERY TENTANG PEMBOROSAN / HEMAT / SARAN / TIPS
      else if (prompt.includes('boros') || prompt.includes('hemat') || prompt.includes('saran') || prompt.includes('tips') || prompt.includes('sehat') || prompt.includes('keuangan')) {
        const highest = stats.categoryBreakdown[0];
        const expenseRatio = stats.totalIncome > 0 ? (stats.totalExpense / stats.totalIncome) * 100 : 100;
        
        let customAdvice = '';
        if (expenseRatio >= 80) {
          customAdvice = `Awas! Rasio pengeluaran Anda sudah mencapai **${expenseRatio.toFixed(1)}%** dari pemasukan Anda. Ini tergolong **sangat boros** dan berisiko defisit. AI sangat menyarankan untuk menunda pengeluaran non-primer.`;
        } else if (expenseRatio >= 50) {
          customAdvice = `Rasio pengeluaran Anda berada di angka **${expenseRatio.toFixed(1)}%**. Cukup wajar, namun Anda masih bisa mengoptimalkan tabungan dengan mengurangi anggaran di kategori non-esensial.`;
        } else {
          customAdvice = `Luar biasa! Rasio pengeluaran Anda hanya **${expenseRatio.toFixed(1)}%** dari pemasukan. Kesehatan finansial Anda sangat prima!`;
        }

        reply = `Berdasarkan analisis finansial cerdas kami:\n\n1. ${customAdvice}\n2. Kategori pengeluaran tertinggi Anda adalah **${highest ? highest.name.toUpperCase() : 'belum ada'}** sebesar **${formatRupiah(highest ? highest.value : 0)}**.\n3. **Tips Penghematan**: Gunakan metode alokasi dana darurat otomatis langsung di awal bulan, dan pisahkan dana belanja harian ke rekening **Wallet** agar tidak mengganggu dana utama di rekening **Bank** Anda.`;
      }
      // 7. PREDIKSI MASA DEPAN / BULAN DEPAN
      else if (prompt.includes('prediksi') || prompt.includes('masa depan') || prompt.includes('proyeksi') || prompt.includes('depan')) {
        if (stats.totalExpense > 0) {
          const predicted = stats.totalExpense * 1.05;
          reply = `Menggunakan analisis tren pengeluaran saat ini (**${formatRupiah(stats.totalExpense)}**), AI memprediksi bahwa total pengeluaran Anda bulan depan akan berkisar **${formatRupiah(predicted)}**.\n\nRekomendasi AI: Tekan pengeluaran pada kategori **${stats.categoryBreakdown[0] ? stats.categoryBreakdown[0].name.toUpperCase() : 'lainnya'}** agar total pengeluaran Anda tetap berada di bawah prediksi batas aman tersebut.`;
        } else {
          reply = `AI belum memiliki data transaksi pengeluaran yang cukup untuk membuat prediksi yang akurat. Silakan tambahkan beberapa transaksi pengeluaran terlebih dahulu!`;
        }
      }
      // 8. INTERAKSI HALO / HAI / SAPAAN
      else if (prompt.includes('halo') || prompt.includes('hai') || prompt.includes('pagi') || prompt.includes('siang') || prompt.includes('sore') || prompt.includes('malam') || prompt.includes('sapa') || prompt.includes('siapa')) {
        reply = `Halo! Saya adalah **Asisten AI RafTrack Gemini** 🌌.

Saya siap membantu memantau dan menganalisis seluruh data keuangan Anda secara real-time. Anda bisa bertanya tentang:
- Saldo Anda di rekening **Bank**, **Wallet**, atau **Cash**
- Pengeluaran terbesar Anda atau rincian kategori seperti **makanan**
- Riwayat **transaksi terakhir**
- Saran penghematan (**apakah saya boros?**)

Ada yang bisa saya bantu sekarang?`;
      }
      // 9. DEFAULT SMART FALLBACK
      else {
        reply = `Pesan Anda ("*${message}*") diterima dengan baik oleh sistem AI.

Saat ini saldo bersih Anda adalah **${formatRupiah(stats.balance)}** yang tersebar di **Bank** (**${formatRupiah(stats.bankBalance)}**), **Wallet** (**${formatRupiah(stats.walletBalance)}**), dan **Cash** (**${formatRupiah(stats.cashBalance)}**). 

Apakah Anda ingin saya memberikan saran penghematan anggaran, menganalisis kategori belanja tertentu, atau memeriksa catatan transaksi terbaru Anda? Silakan perintahkan saya!`;
      }
    }

    res.status(200).json({
      success: true,
      reply
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Proses Pemindaian Struk Belanja dengan NVIDIA AI Vision / OCR
// @route   POST /api/analytics/ocr
// @access  Private
const handleReceiptOCR = async (req, res, next) => {
  try {
    const { image, mimeType } = req.body;

    if (!image) {
      res.status(400);
      throw new Error('Harap sertakan gambar struk terenkripsi Base64');
    }

    const safeMimeType = mimeType || 'image/jpeg';
    const nvidiaApiKey = process.env.NVIDIA_API_KEY || "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";
    const primaryModel = process.env.NVIDIA_MODEL || "meta/llama-3.2-11b-vision-instruct";
    const geminiApiKey = process.env.GEMINI_API_KEY;

    // Ensure data URI format for vision API
    const dataUri = image.startsWith('data:') ? image : `data:${safeMimeType};base64,${image}`;
    const cleanBase64 = image.includes('base64,') ? image.split('base64,')[1] : image;

    const prompt = `Anda adalah sistem AI Vision OCR spesialis struk belanja & faktur Indonesia berakurasi tinggi.
Tugas Anda: Baca gambar struk belanja / nota kasir / invoice ini secara seksama dan ekstrak informasi ke format JSON.

PANDUAN KATEGORISASI (PENTING):
- 'transportasi': jika struk dari SPBU (Pertamina, Shell, BP, bensin, solar, pertalite, pertamax), tiket kereta/pesawat/bus, grab, gojek, parkir, tol, bengkel motor/mobil.
- 'tagihan': jika struk pembayaran listrik PLN, token listrik, PDAM/air, Indihome/Wifi, pulsa/kuota data Telkomsel/XL/Indosat, BPJS.
- 'makanan': jika struk dari restoran, cafe, warung makan, kedai kopi, bakery, belanja makanan di minimarket.
- 'hiburan': jika tiket bioskop (XXI, CGV), game/voucher, tempat wisata, rekreasi, streaming.
- 'investasi': jika pembelian emas, reksadana, aset kripto, tabungan berjangka.
- 'lainnya': belanja supermarket kebutuhan rumah tangga non-makanan, pakaian, obat apotek, dll.

Wajib berikan respon HANYA dalam format JSON valid tanpa penjelasan tambahan dan tanpa blok pembungkus markdown (tanpa \`\`\`json).

Format JSON yang wajib dipatuhi:
{
  "merchant": "Nama toko / merchant ritel (contoh: 'Pertamina', 'Indomaret', 'Alfamart', 'KFC', dll. Bersihkan dari simbol)",
  "amount": Total nominal pembayaran akhir (angka/integer bulat murni tanpa titik/koma/Rp, contoh: 50000, 125000),
  "date": "Tanggal transaksi format YYYY-MM-DD (jika buram, gunakan: ${new Date().toISOString().substring(0, 10)})",
  "category": "Pilih salah satu dari: 'transportasi', 'makanan', 'tagihan', 'hiburan', 'investasi', 'lainnya'",
  "description": "Deskripsi singkat (contoh: 'Beli Bahan Bakar di Pertamina', 'Belanja di Indomaret')",
  "items": ["Maksimal 3 item belanjaan utama dalam format 'Qtyx NamaItem', contoh: '1x Pertalite 5L', '2x Roti'"]
}`;

    const parseJSONSafely = (text) => {
      if (!text) throw new Error("Respon teks kosong dari AI Vision");
      const startIdx = text.indexOf('{');
      const endIdx = text.lastIndexOf('}');
      if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
        throw new Error("Format JSON tidak ditemukan dalam respon AI");
      }
      const cleanJson = text.substring(startIdx, endIdx + 1);
      return JSON.parse(cleanJson);
    };

    let ocrResult = null;
    let usedSource = null;
    let usedModel = null;

    // ========================================================
    // 1. UTAMA: NVIDIA AI VISION OCR (Meta Llama 3.2 11B Vision)
    // ========================================================
    if (nvidiaApiKey) {
      const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
      
      const callNvidiaModel = async (modelName, timeoutMs = 15000) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
          const payload = {
            model: modelName,
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  { type: "image_url", image_url: { url: dataUri } }
                ]
              }
            ],
            max_tokens: 1024,
            temperature: 0.1,
            top_p: 0.95
          };

          const response = await fetch(invokeUrl, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${nvidiaApiKey}`,
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(payload),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(`HTTP ${response.status}: ${errBody.error?.message || response.statusText}`);
          }

          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          return parseJSONSafely(content);
        } finally {
          clearTimeout(timeoutId);
        }
      };

      // Coba model prioritas (Meta Llama 3.2 11B Vision - Sangat Cepat & Akurat)
      try {
        console.log(`[NVIDIA OCR] Memproses struk dengan model utama: ${primaryModel}...`);
        ocrResult = await callNvidiaModel(primaryModel, 15000);
        usedSource = 'nvidia';
        usedModel = primaryModel;
      } catch (nvidiaErr) {
        console.warn(`[NVIDIA OCR Warning] Model ${primaryModel} gagal/timeout:`, nvidiaErr.message);
        
        // Cadangan ke Nemotron jika model pertama bermasalah
        if (primaryModel !== "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning") {
          try {
            const fallbackModel = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning";
            console.log(`[NVIDIA OCR] Mencoba cadangan: ${fallbackModel}...`);
            ocrResult = await callNvidiaModel(fallbackModel, 12000);
            usedSource = 'nvidia';
            usedModel = fallbackModel;
          } catch (secErr) {
            console.warn(`[NVIDIA OCR Warning] Cadangan juga gagal:`, secErr.message);
          }
        }
      }
    }

    // ========================================================
    // 2. CADANGAN: GOOGLE GEMINI MULTIMODAL AI (JIKA DIKONFIGURASI)
    // ========================================================
    if (!ocrResult && geminiApiKey) {
      try {
        console.log("[OCR Fallback] Mencoba Gemini 1.5 Flash...");
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const imagePart = {
          inlineData: {
            data: cleanBase64,
            mimeType: safeMimeType
          }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text().trim();
        ocrResult = parseJSONSafely(responseText);
        usedSource = 'gemini';
        usedModel = 'gemini-1.5-flash';
      } catch (geminiErr) {
        console.warn("[Gemini OCR Fallback Warning]:", geminiErr.message);
      }
    }

    // Jika semua model AI gagal mengenali struk, kembalikan respon error yang transparan (bukan data palsu acak!)
    if (!ocrResult) {
      res.status(422);
      throw new Error("AI Vision belum berhasil mengenali teks struk. Harap pastikan foto struk memiliki pencahayaan cukup dan teks terlihat jelas.");
    }

    // Normalisasi data hasil ekstraksi agar konsisten dan valid
    const normalizedData = {
      merchant: ocrResult.merchant || 'Struk Retail',
      amount: typeof ocrResult.amount === 'number' && !isNaN(ocrResult.amount)
        ? Math.round(ocrResult.amount)
        : parseInt(String(ocrResult.amount || '0').replace(/[^0-9]/g, '')) || 0,
      date: ocrResult.date || new Date().toISOString().substring(0, 10),
      category: ['makanan', 'transportasi', 'tagihan', 'hiburan', 'investasi', 'lainnya'].includes(String(ocrResult.category).toLowerCase())
        ? String(ocrResult.category).toLowerCase()
        : 'lainnya',
      description: ocrResult.description || `Belanja di ${ocrResult.merchant || 'Retail'}`,
      items: Array.isArray(ocrResult.items) && ocrResult.items.length > 0 ? ocrResult.items : ['1x Item Pembelian']
    };

    res.status(200).json({
      success: true,
      source: usedSource,
      model: usedModel,
      data: normalizedData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalyticsStats,
  handleAIChatbot,
  handleReceiptOCR
};
