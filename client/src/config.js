// ========================================================
// KONFIGURASI SINCRONISASI API FRONTEND (VERCEL) & BACKEND (RAILWAY)
// ========================================================

export const API_URL = import.meta.env.DEV
  ? '' // Menggunakan proxy Vite lokal pada saat Development untuk menghindari kendala CORS
  : (import.meta.env.VITE_API_URL || 'https://raftrack-gemini-production.up.railway.app');

// KETERANGAN:
// 1. Pada mode lokal (Development), URL akan kosong sehingga fetch('/api/...') otomatis diarahkan ke proxy localhost.
// 2. Pada mode Production (Vercel), URL akan otomatis menggunakan variabel VITE_API_URL yang diatur di panel Vercel Anda,
//    atau beralih ke fallback domain publik Railway Anda.
