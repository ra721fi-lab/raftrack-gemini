# 🌌 RafTrack Gemini - Futuristic Financial AI Tracker

RafTrack Gemini adalah aplikasi pencatatan keuangan modern berbasis fullstack dengan desain futuristik premium (*glassmorphism*, neon blue/purple, AI insights, dll.) layaknya aplikasi fintech masa depan.

Aplikasi ini dibangun menggunakan tumpukan teknologi modern yang sangat terstruktur, aman, cepat, dan siap dideploy ke VPS/hosting.

---

## 🚀 Fitur Utama & Premium

1. **Dashboard Fintech AI**: Panel visual interaktif yang melacak total saldo, pemasukan, pengeluaran, agregasi rasio, serta visualisasi tren.
2. **AI Finance Insight**: Heuristic engine cerdas yang menganalisis pengeluaran terbesar, memberikan notifikasi batas penghematan (*overspending alert*), dan memberikan saran penabung cerdas.
3. **AI Chatbot Advisor**: Chatbot interaktif di sudut layar yang terintegrasi secara langsung dengan data transaksi asli Anda untuk menjawab konsultasi finansial harian Anda.
4. **Voice Input Transaction**: Menggunakan **Web Speech API** bawaan browser untuk menerjemahkan perintah suara bahasa Indonesia (contoh: *"Makan siang lima puluh ribu rupiah"*) langsung mengisi nominal, kategori, dan deskripsi secara instan.
5. **OCR Scan Receipt (Simulasi)**: Pemindai struk belanja melayang dengan viewfinder kamera melayang dan animasi laser menyala untuk mengekstrak data nominal, merchant, dan item secara otomatis.
6. **Smart Database Fallback (Lokadata)**: Sistem deteksi database cerdas. Jika koneksi MySQL Anda gagal atau belum disiapkan, server otomatis beralih menggunakan basis data JSON lokal (`lokadata.json`) agar aplikasi dapat segera berjalan 100% instan untuk keperluan demo.
7. **Auto Seeder & Seeding**: Begitu mendaftar akun baru, sistem langsung memasukkan **12 data riwayat transaksi realistis** dari 25 hari terakhir agar grafik dashboard langsung terlihat kaya dan menawan!
8. **Ekspor Data & Cetak**: Cetak laporan ramah printer atau ekspor riwayat keuangan Anda secara instan ke file **Excel/CSV**.

---

## 🛠️ Tumpukan Teknologi (Stack)

*   **Frontend**: React.js (Vite), TailwindCSS, Framer Motion (Animasi), Recharts (Grafik Glowing), Lucide Icons.
*   **Backend**: Node.js, Express.js.
*   **Database**: MySQL (pustaka `mysql2/promise` dengan pooling & auto-migration).
*   **Security & Auth**: JWT Login, Bcrypt password hashing, Helmet security headers, CORS, Express Rate Limiter.

---

## 📁 Struktur Folder Proyek

```text
raftrack_gemini/
│
├── client/                     # Frontend (React + Vite)
│   ├── public/                 
│   ├── src/
│   │   ├── components/         # Sidebar, Header, AIChatbot, Toast, VoiceInput, OCRScanner
│   │   ├── context/            # AuthContext, TransactionContext, ThemeContext
│   │   ├── pages/              # Dashboard, Transactions, Login, Register
│   │   ├── index.css           # Core styling, Neon, Glassmorphism formulas
│   │   ├── main.jsx            # Entry point render
│   │   └── App.jsx             # Main Router & split authentication state
│   ├── tailwind.config.js      # Konfigurasi custom neon color & shadows
│   ├── vite.config.js          
│   └── package.json            
│
└── server/                     # Backend (Node.js + Express)
    ├── config/                 # db.js (Koneksi pooling & fallback JSON)
    ├── controllers/            # Logic API (auth, transactions, analytics, export)
    ├── middleware/             # authMiddleware, rateLimiter, errorHandler
    ├── models/                 # dbInit.js (auto migrations), userModel, transactionModel
    ├── routes/                 # Rute REST API
    ├── schema.sql              # Skema database MySQL lengkap
    ├── server.js               # Entrypoint Utama Server
    ├── .env                    # Variabel Lingkungan Aktif
    └── package.json            
```

---

## 🔌 Dokumentasi REST API

### 1. Autentikasi Pengguna (`/api/auth`)
*   `POST /api/auth/register` : Mendaftarkan akun baru (sekaligus memicu *auto-seeder* 12 transaksi).
*   `POST /api/auth/login` : Masuk menggunakan username atau email dan mendapatkan JWT token.
*   `GET /api/auth/profile` : Dapatkan detail informasi user aktif (Membutuhkan JWT Bearer Token).

### 2. Transaksi Keuangan (`/api/transactions`)
*   `GET /api/transactions` : Mengambil semua transaksi user aktif (Mendukung filter pencarian `?search=`, jenis `?type=`, kategori `?category_id=`, tanggal).
*   `POST /api/transactions` : Mencatat transaksi baru (Mendukung resolusi otomatis nama kategori).
*   `GET /api/transactions/:id` : Melihat rincian transaksi tunggal.
*   `PUT /api/transactions/:id` : Memperbarui data transaksi.
*   `DELETE /api/transactions/:id` : Menghapus transaksi.

### 3. Analisis & AI (`/api/analytics`)
*   `GET /api/analytics/stats` : Dapatkan ringkasan total saldo, agregasi chart, alert notifikasi batas penghematan, prediksi bulan depan, dan alokasi AI.
*   `POST /api/analytics/chatbot` : Berinteraksi dengan Gemini AI chatbot menggunakan teks bebas.

### 4. Ekspor Data (`/api/export`)
*   `GET /api/export/csv` : Mengunduh file laporan dalam format CSV (Excel).
*   `GET /api/export/print` : Mendapatkan data print terstruktur.

---

## ⚙️ Petunjuk Instalasi & Menjalankan Proyek

Pastikan Anda memiliki **Node.js (versi >= 16)** yang sudah terinstal di sistem operasi Anda.

### Langkah 1: Kloning / Buka Folder Proyek
Buka terminal/command prompt di direktori proyek `raftrack_gemini/`.

### Langkah 2: Jalankan Dependensi Server (Backend)
1. Masuk ke direktori server:
   ```bash
   cd server
   ```
2. Instal semua dependensi Node:
   ```bash
   npm install
   ```
3. *(Opsional)* Jika Anda menggunakan MySQL, sesuaikan konfigurasi host, user, password, dan database pada file `.env` di dalam folder server. Jika tidak diubah, server otomatis berjalan menggunakan database lokal JSON (`server/models/lokadata.json`) tanpa crash.
4. Jalankan server dalam mode development:
   ```bash
   npm run start
   ```
   *Server akan berjalan di: **http://localhost:5000***

### Langkah 3: Jalankan Dependensi Client (Frontend)
1. Buka tab terminal baru, kembali ke direktori root, lalu masuk ke direktori client:
   ```bash
   cd client
   ```
2. Instal semua dependensi React:
   ```bash
   npm install
   ```
3. Jalankan server development Vite React:
   ```bash
   npm run dev
   ```
   *Aplikasi web React akan berjalan di: **http://localhost:3000***

Buka browser Anda di **http://localhost:3000** dan nikmati kemewahan pencatatan keuangan futuristik Anda! ✨
