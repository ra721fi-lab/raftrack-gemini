import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

const VoiceInputButton = ({ onSpeechDetected, addToast }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Inisialisasi Speech Recognition API bawaan browser
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'id-ID'; // Bahasa Indonesia
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
        if (addToast) addToast('Perekaman suara aktif. Silakan berbicara...', 'info');
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (event) => {
        console.error('[Voice Speech Error]', event.error);
        setIsListening(false);
        if (addToast) addToast(`Gagal merekam suara: ${event.error}`, 'error');
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('[Voice Transcript Received]', transcript);
        parseVoiceCommand(transcript);
      };

      setRecognition(rec);
    }
  }, []);

  // Fungsi utilitas untuk menerjemahkan angka kata bahasa Indonesia menjadi Integer angka
  const wordToNumber = (text) => {
    const cleanText = text.toLowerCase();
    
    // Kamus dasar angka kata
    const dict = {
      'satu': 1, 'dua': 2, 'tiga': 3, 'empat': 4, 'lima': 5, 
      'enam': 6, 'tujuh': 7, 'delapan': 8, 'sembilan': 9, 'sepuluh': 10,
      'sebelas': 11, 'seratus': 100, 'seribu': 1000, 'sejuta': 1000000
    };

    // Regex pencocokan nominal rupiah umum
    // Contoh: "seratus lima puluh ribu" -> 150000
    // "dua puluh lima ribu" -> 25000
    // "tiga juta" -> 3000000
    let amount = 0;
    
    // Coba parsing langsung dari digit angka di dalam teks (misal "50 ribu" atau "100000")
    const digitMatch = cleanText.match(/\d+/g);
    if (digitMatch) {
      let parsedDigit = parseInt(digitMatch.join(''), 10);
      if (cleanText.includes('ribu')) parsedDigit *= 1000;
      if (cleanText.includes('juta')) parsedDigit *= 1000000;
      return parsedDigit;
    }

    // Pemrosesan teks nominal bahasa indonesia manual secara terstruktur
    let words = cleanText.split(' ');
    
    // Parsing manual untuk nominal populer di Indonesia
    if (cleanText.includes('seratus ribu')) return 100000;
    if (cleanText.includes('dua ratus ribu')) return 200000;
    if (cleanText.includes('tiga ratus ribu')) return 300000;
    if (cleanText.includes('empat ratus ribu')) return 400000;
    if (cleanText.includes('lima ratus ribu')) return 500000;
    if (cleanText.includes('lima puluh ribu')) return 500000; // Typo pengucapan
    if (cleanText.includes('lima puluh ribu')) return 50000;
    if (cleanText.includes('dua puluh lima ribu')) return 25000;
    if (cleanText.includes('tiga puluh ribu')) return 30000;
    if (cleanText.includes('sepuluh ribu')) return 10000;
    if (cleanText.includes('dua puluh ribu')) return 20000;
    if (cleanText.includes('lima belas ribu')) return 15000;
    if (cleanText.includes('lima puluh ribu')) return 50000;
    
    // Pengali nominal
    let multiplier = 1;
    if (cleanText.includes('juta')) multiplier = 1000000;
    else if (cleanText.includes('ratus ribu')) multiplier = 100000;
    else if (cleanText.includes('puluh ribu')) multiplier = 10000;
    else if (cleanText.includes('ribu')) multiplier = 1000;

    // Bersihkan kata pengali dan 'rupiah'
    words = words.filter(w => !['rupiah', 'ribu', 'puluh', 'ratus', 'juta'].includes(w));
    
    // Jumlahkan sisa kata angka
    let baseSum = 0;
    words.forEach(w => {
      if (dict[w]) baseSum += dict[w];
    });

    if (baseSum === 0) return 0;
    return baseSum * multiplier;
  };

  // Parsing perintah suara menjadi entri transaksi terstruktur
  const parseVoiceCommand = (transcript) => {
    const text = transcript.toLowerCase();
    
    // 1. Ekstraksi Nominal Uang
    const amount = wordToNumber(text);
    if (!amount || amount === 0) {
      if (addToast) addToast(`Suara terdeteksi: "${transcript}". Namun nominal rupiah tidak terbaca. Harap sebutkan nominal (misal: "Makan siang lima puluh ribu rupiah").`, 'warning');
      return;
    }

    // 2. Tentukan Jenis Transaksi (pemasukan vs pengeluaran)
    let type = 'pengeluaran'; // Default pengeluaran
    if (
      text.includes('gaji') || 
      text.includes('bonus') || 
      text.includes('dapat') || 
      text.includes('terima') || 
      text.includes('pemasukan') ||
      text.includes('investasi untung')
    ) {
      type = 'pemasukan';
    }

    // 3. Tentukan Kategori Berdasarkan Kata Kunci
    let category_name = 'lainnya'; // Default
    if (text.includes('makan') || text.includes('minum') || text.includes('kopi') || text.includes('restoran') || text.includes('bakso') || text.includes('sarapan')) {
      category_name = 'makanan';
    } else if (text.includes('bensin') || text.includes('gojek') || text.includes('grab') || text.includes('taksi') || text.includes('motor') || text.includes('mobil') || text.includes('transport')) {
      category_name = 'transportasi';
    } else if (text.includes('listrik') || text.includes('air') || text.includes('internet') || text.includes('wifi') || text.includes('indihome') || text.includes('pulsa') || text.includes('tagihan')) {
      category_name = 'tagihan';
    } else if (text.includes('nonton') || text.includes('bioskop') || text.includes('netflix') || text.includes('spotify') || text.includes('game') || text.includes('hiburan') || text.includes('main')) {
      category_name = 'hiburan';
    } else if (text.includes('saham') || text.includes('investasi') || text.includes('reksadana') || text.includes('kripto') || text.includes('bitcoin') || text.includes('tabungan')) {
      category_name = 'investasi';
    } else if (text.includes('gaji') || text.includes('bonus') || text.includes('upah')) {
      category_name = 'gaji';
    }

    // 4. Ekstraksi Deskripsi Transaksi (membersihkan kata-kata bantu & nominal rupiah)
    let description = transcript;
    
    // Hapus nominal uang dari teks deskripsi agar deskripsi lebih bersih
    const stopWords = [
      'rupiah', 'ribu', 'juta', 'ratus', 'puluh', 'sebesar', 'senilai', 'sebanyak',
      'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh',
      'beli', 'bayar', 'catat', 'masukkan', 'pemasukan', 'pengeluaran'
    ];
    
    // Coba hapus juga digit mentah
    description = description.replace(/\d+/g, '');

    let descWords = description.toLowerCase().split(' ');
    descWords = descWords.filter(w => !stopWords.includes(w) && w.trim().length > 0);
    
    let finalDescription = descWords.join(' ');
    if (!finalDescription) {
      finalDescription = type === 'pemasukan' ? 'Penerimaan Pemasukan' : 'Pengeluaran Belanja';
    } else {
      // Huruf kapital awal kata
      finalDescription = finalDescription.charAt(0).toUpperCase() + finalDescription.slice(1);
    }

    // Panggil callback parent form
    onSpeechDetected({
      amount,
      type,
      category_name,
      description: finalDescription,
      date: new Date().toISOString().substring(0, 10)
    });

    if (addToast) addToast(`Berhasil menerjemahkan suara: "${transcript}"`, 'success');
  };

  const toggleListening = () => {
    if (!recognition) {
      if (addToast) addToast('Speech Recognition tidak didukung di browser ini. Gunakan Chrome/Edge.', 'warning');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  return (
    <div className="flex items-center gap-2 font-mono">
      {isListening ? (
        <button
          type="button"
          onClick={toggleListening}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neonRed/20 border border-neonRed text-neonRed shadow-neon-red/30 animate-pulse transition-all"
        >
          <MicOff className="w-4 h-4 animate-bounce" />
          <span className="text-[10px] font-bold tracking-widest uppercase">MENDENGARKAN...</span>
          
          {/* Soundwave Visualizer Bars */}
          <div className="flex items-center gap-0.5 ml-2 h-4">
            <span className="w-[2px] bg-neonRed soundwave-bar" style={{ animationDelay: '0ms' }}></span>
            <span className="w-[2px] bg-neonRed soundwave-bar" style={{ animationDelay: '150ms' }}></span>
            <span className="w-[2px] bg-neonRed soundwave-bar" style={{ animationDelay: '300ms' }}></span>
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={toggleListening}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neonBlue/10 border border-neonBlue/30 text-neonBlue hover:bg-neonBlue/20 transition-all group"
        >
          <Mic className="w-4 h-4 group-hover:scale-115 transition-transform" />
          <span className="text-[10px] font-bold tracking-widest uppercase">Input Suara AI</span>
        </button>
      )}
    </div>
  );
};

export default VoiceInputButton;
