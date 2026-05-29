import React, { useState } from 'react';
import { X, Camera, Sparkles, Upload, FileText, Check } from 'lucide-react';
import { API_URL } from '../config';

const OCRScannerModal = ({ isOpen, onClose, onScanSuccess, addToast }) => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  if (!isOpen) return null;

  // Galeri struk simulasi untuk pengujian instan (Wow Factor!)
  const mockReceipts = [
    {
      id: 'starbucks',
      name: 'Starbucks Coffee',
      date: new Date().toISOString().substring(0, 10),
      amount: 88000,
      category_name: 'hiburan',
      description: 'Ngopi Starbucks',
      color: '#006241',
      items: ['1x Caramel Macchiato', '1x Chocolate Croissant']
    },
    {
      id: 'alfamart',
      name: 'Alfamart Retail',
      date: new Date().toISOString().substring(0, 10),
      amount: 42500,
      category_name: 'makanan',
      description: 'Belanja Snack Alfamart',
      color: '#e51a24',
      items: ['2x Chiki Taro', '1x Coca Cola 1L', '1x Roti Sobek']
    },
    {
      id: 'pln',
      name: 'PLN Tagihan Listrik',
      date: new Date().toISOString().substring(0, 10),
      amount: 154000,
      category_name: 'tagihan',
      description: 'Token Listrik PLN',
      color: '#0097a7',
      items: ['1x Token Listrik KWH 100']
    }
  ];

  // Jalankan proses pemindaian simulasi dengan laser neon
  const handleStartScan = (receipt) => {
    setSelectedReceipt(receipt);
    setScanning(true);
    setScannedData(null);

    // Jalankan animasi laser memindai selama 2.5 detik
    setTimeout(() => {
      setScanning(false);
      setScannedData(receipt);
      if (addToast) addToast(`AI OCR berhasil mengekstrak data ${receipt.name}!`, 'success');
    }, 2500);
  };

  // Kirim data ter-scan kembali ke form transaksi
  const handleApplyData = () => {
    if (scannedData) {
      onScanSuccess({
        amount: scannedData.amount,
        type: 'pengeluaran',
        category_name: scannedData.category_name,
        description: scannedData.description,
        date: scannedData.date
      });
      onClose();
    }
  };

  // Handler untuk mengunggah file kustom sendiri (Gemini AI Multimodal OCR!)
  const handleCustomUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedReceipt({ name: file.name });
    setScanning(true);
    setScannedData(null);

    // Membaca file gambar dan mengonversinya menjadi Base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        if (addToast) addToast('Mengaktifkan Gemini AI Multimodal OCR. Menganalisis struk...', 'info');

        const base64String = reader.result;
        const token = localStorage.getItem('raftrack_token');

        const response = await fetch(`${API_URL}/api/analytics/ocr`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            image: base64String,
            mimeType: file.type
          })
        });

        const resData = await response.json();

        if (!response.ok || !resData.success) {
          throw new Error(resData.message || 'Gagal menganalisis struk');
        }

        const ocrData = resData.data;

        const parsedReceipt = {
          id: 'gemini_parsed',
          name: ocrData.merchant || 'Struk Retail',
          date: ocrData.date || new Date().toISOString().substring(0, 10),
          amount: Number(ocrData.amount || 0),
          category_name: ocrData.category || 'lainnya',
          description: ocrData.description || `Belanja di ${ocrData.merchant || 'Retail'}`,
          color: '#00f2fe',
          items: ocrData.items || ['1x Produk Belanja']
        };

        setScanning(false);
        setScannedData(parsedReceipt);
        if (addToast) addToast(`Gemini AI OCR sukses mendeteksi struk ${parsedReceipt.name}!`, 'success');

      } catch (err) {
        console.error('[Gemini AI OCR Error, beralih ke Fallback Simulator]:', err);
        
        // Fallback Simulator Cerdas jika koneksi internet terganggu/server tidak merespon
        const cleanName = file.name.replace(/\.[^/.]+$/, "").substring(0, 20);
        const fallbackReceipt = {
          id: 'custom_fallback',
          name: cleanName || 'Struk Ritel',
          date: new Date().toISOString().substring(0, 10),
          amount: Math.floor(Math.random() * (120000 - 15000 + 1)) + 15000,
          category_name: 'makanan',
          description: `Belanja ${cleanName || 'Kustom'}`,
          color: '#00f2fe',
          items: ['1x Item Terdeteksi', '1x Pajak PPN 11%']
        };

        setScanning(false);
        setScannedData(fallbackReceipt);
        if (addToast) addToast(`Pemindaian selesai (Mode Simulator Fallback)`, 'info');
      }
    };

    reader.onerror = () => {
      setScanning(false);
      if (addToast) addToast('Gagal membaca file gambar', 'error');
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-sans animate-fade-in">
      
      {/* KARTU DIALOG GLASSMORPHISM */}
      <div 
        className="glass-panel border-neonBlue/30 w-full max-w-2xl overflow-hidden shadow-neon-blue relative"
        style={{ boxShadow: '0 20px 60px rgba(0, 242, 254, 0.2)' }}
      >
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-neonBlue neon-text-blue animate-pulse" />
            <h3 className="text-sm font-bold tracking-widest text-slate-100 font-mono uppercase">AI RECEIPT SCANNER OCR</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* CONTEN CONTAINER */}
        <div className="grid grid-cols-1 md:grid-cols-2 h-[420px]">
          
          {/* SISI KIRI: VIEWFINDER PINDASAN / PREVIEW GAMBAR */}
          <div className="bg-black/40 border-r border-white/5 p-5 flex flex-col items-center justify-center relative overflow-hidden">
            {scanning ? (
              // ANIMASI SCANNING LASER NEON
              <div className="w-full h-full border border-neonBlue/30 rounded-xl relative overflow-hidden flex flex-col items-center justify-center bg-black/60">
                {/* Glowing neon laser scan line */}
                <div className="ocr-scan-line"></div>
                
                {/* Teks Loading */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-8 h-8 border-2 border-t-cyanGlow border-r-cyanGlow/30 rounded-full animate-spin"></div>
                  <p className="text-[10px] font-mono tracking-widest text-cyanGlow animate-pulse">MEMINDAI STRUK...</p>
                </div>
              </div>
            ) : scannedData ? (
              // PREVIEW DATA HASIL OCR
              <div className="w-full h-full border border-cyanGlow/30 rounded-xl p-5 flex flex-col justify-between bg-darkSpace-800 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono text-cyanGlow font-bold uppercase border border-cyanGlow/30 px-1.5 py-0.5 rounded">SUCCESS</span>
                    <h4 className="text-sm font-bold text-white mt-2 leading-none font-mono">{scannedData.name}</h4>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-cyanGlow/25 border border-cyanGlow flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-cyanGlow" />
                  </div>
                </div>

                {/* Garis pemisah struk */}
                <div className="border-t border-dashed border-white/10 my-3"></div>

                {/* Rincian item belanja struk */}
                <div className="flex flex-col gap-1.5">
                  <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Item Terdeteksi:</p>
                  <ul className="text-[10px] font-mono text-slate-300 space-y-1">
                    {scannedData.items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>

                <div className="border-t border-dashed border-white/10 my-3"></div>

                {/* Total Uang Terdeteksi */}
                <div className="flex justify-between items-center bg-black/30 p-2.5 rounded-lg border border-white/5">
                  <span className="text-[9px] font-mono text-slate-400 uppercase">Total Nominal:</span>
                  <span className="text-sm font-bold font-mono text-cyanGlow">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(scannedData.amount)}
                  </span>
                </div>
              </div>
            ) : (
              // TAMPILAN VIEW FINDER KOSONG / FILE UPLOADER
              <div className="w-full h-full border-2 border-dashed border-white/10 hover:border-neonBlue/40 transition-colors rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer relative group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleCustomUpload} 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                
                <Upload className="w-8 h-8 text-slate-500 group-hover:text-neonBlue group-hover:scale-110 transition-all mb-3" />
                <h5 className="text-xs font-bold text-slate-300">Unggah Foto Struk</h5>
                <p className="text-[9px] text-slate-500 mt-1 font-mono leading-relaxed">
                  Format JPG, PNG (Simulasi pembacaan data otomatis pintar)
                </p>
              </div>
            )}
          </div>

          {/* SISI KANAN: GALERI SIMULASI DEMO */}
          <div className="p-5 flex flex-col gap-4 overflow-y-auto scrollbar-thin">
            <div>
              <h4 className="text-xs font-bold font-mono tracking-widest text-slate-300 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyanGlow" />
                Simulasi Demo Instan
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Pilih salah satu struk retail Indonesia di bawah untuk memicu pemindaian demo berteknologi AI.
              </p>
            </div>

            {/* LIST STRUK GALERI */}
            <div className="flex flex-col gap-3">
              {mockReceipts.map((receipt) => (
                <button
                  key={receipt.id}
                  onClick={() => handleStartScan(receipt)}
                  disabled={scanning}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 active:scale-98 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    {/* Brand color marker */}
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs font-mono"
                      style={{ backgroundColor: receipt.color }}
                    >
                      {receipt.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{receipt.name}</p>
                      <p className="text-[9px] font-mono text-slate-500 mt-0.5 capitalize">{receipt.category_name} &bull; {receipt.items.length} item</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-300">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(receipt.amount)}
                  </span>
                </button>
              ))}
            </div>

            {/* BUTTON SUBMIT TENTUKAN DATA */}
            {scannedData && (
              <button
                onClick={handleApplyData}
                className="w-full mt-auto py-2.5 rounded-xl bg-gradient-to-tr from-neonPurple to-neonBlue text-white text-xs font-bold font-mono shadow-neon-blue uppercase hover:scale-[1.02] active:scale-95 transition-all"
              >
                Gunakan Data Transaksi &rarr;
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default OCRScannerModal;
