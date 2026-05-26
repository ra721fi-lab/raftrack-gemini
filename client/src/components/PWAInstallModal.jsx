import React, { useContext } from 'react';
import { PWAContext } from '../context/PWAContext';
import { X, Download, Share, Plus, Smartphone, Sparkles, Cpu, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PWAInstallModal = () => {
  const { showInstallGuide, setShowInstallGuide, isIOS, installApp } = useContext(PWAContext);

  if (!showInstallGuide) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Dark overlay with blur effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowInstallGuide(false)}
          className="absolute inset-0 bg-darkSpace-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md glass-panel border border-white/10 bg-darkSpace-900/90 shadow-2xl rounded-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Ambient light effects inside modal */}
          <div className="absolute -top-12 -left-12 w-28 h-28 bg-neonBlue/15 rounded-full blur-xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-neonPurple/15 rounded-full blur-xl pointer-events-none"></div>

          {/* Close button */}
          <button
            onClick={() => setShowInstallGuide(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-slate-200 transition-all z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mt-2 mb-6">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-neonPurple to-neonBlue shadow-neon-purple p-[1px] mb-4">
              <div className="w-full h-full bg-darkSpace-900 rounded-[10px] flex items-center justify-center">
                <Cpu className="w-6 h-6 text-neonBlue neon-text-blue" />
              </div>
            </div>
            <h3 className="text-lg font-bold tracking-wide text-white font-mono">
              Pasang Aplikasi RafTrack
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Jadikan RafTrack Gemini aplikasi native di HP Anda
            </p>
          </div>

          {/* Platform Specific Content */}
          {isIOS ? (
            /* ========================================================
               iOS Safari Installation Steps
               ======================================================== */
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl border border-neonPurple/20 bg-neonPurple/5 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-neonPurple flex-shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed text-slate-300">
                  Safari di iPhone/iPad tidak mendukung instalasi otomatis. Ikuti 3 langkah cepat di bawah ini untuk menambahkan RafTrack ke Layar Utama Anda.
                </p>
              </div>

              {/* Steps timeline */}
              <div className="space-y-4 relative pl-7 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-[25px] top-0 w-5 h-5 rounded-full bg-darkSpace-800 border border-white/10 flex items-center justify-center text-[10px] font-mono text-neonBlue font-bold shadow-sm">
                    1
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      Ketuk tombol Bagikan <span className="inline-flex p-1 rounded-md bg-white/5 border border-white/10 text-neonBlue"><Share className="w-3 h-3" /></span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Ketuk ikon bagikan di bilah menu bawah Safari Anda.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-[25px] top-0 w-5 h-5 rounded-full bg-darkSpace-800 border border-white/10 flex items-center justify-center text-[10px] font-mono text-neonBlue font-bold shadow-sm">
                    2
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      Pilih 'Tambahkan ke Layar Utama' <span className="inline-flex p-1 rounded-md bg-white/5 border border-white/10 text-neonPurple"><Plus className="w-3 h-3" /></span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Gulir ke bawah pada menu bagikan dan ketuk opsi tersebut.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="absolute -left-[25px] top-0 w-5 h-5 rounded-full bg-darkSpace-800 border border-white/10 flex items-center justify-center text-[10px] font-mono text-neonBlue font-bold shadow-sm">
                    3
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      Ketuk 'Tambah' di pojok kanan atas
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Konfirmasikan nama aplikasi dan ketuk Tambah untuk menyelesaikan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowInstallGuide(false)}
                  className="w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-slate-300 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all text-center"
                >
                  Saya Mengerti
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================
               Android / Chrome / PC Installation Steps
               ======================================================== */
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl border border-neonBlue/20 bg-neonBlue/5 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-neonBlue flex-shrink-0 mt-0.5 animate-pulse" />
                <p className="text-xs leading-relaxed text-slate-300">
                  Dapatkan pengalaman penuh **RafTrack Gemini** dengan ikon di layar utama, kecepatan loading instan, akses offline aman, dan tanpa konsumsi memori berlebih.
                </p>
              </div>

              {/* Features list */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-neonBlue" />
                  <span className="text-[10px] font-medium text-slate-300 font-mono">Buka Instan</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-neonPurple" />
                  <span className="text-[10px] font-medium text-slate-300 font-mono">Aman Offline</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyanGlow" />
                  <span className="text-[10px] font-medium text-slate-300 font-mono">Tanpa Kuota Web</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-neonBlue" />
                  <span className="text-[10px] font-medium text-slate-300 font-mono">Ukuran &lt; 1MB</span>
                </div>
              </div>

              {/* Install Button */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    installApp();
                  }}
                  className="w-full py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-neonPurple to-neonBlue hover:from-neonPurple/90 hover:to-neonBlue/90 hover:scale-[1.02] shadow-neon-blue active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 animate-bounce" />
                  <span>Pasang Sekarang</span>
                </button>

                <button
                  onClick={() => setShowInstallGuide(false)}
                  className="w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-slate-400 border border-transparent hover:text-slate-200 transition-all text-center"
                >
                  Nanti Saja
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PWAInstallModal;
