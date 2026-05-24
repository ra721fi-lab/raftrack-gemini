# 🌌 Panduan Deploy Fullstack RafTrack Gemini di Railway.app

Railway adalah platform modern yang sangat cocok untuk mengaktifkan **Backend Node.js** sekaligus **Database MySQL** Anda secara online dalam satu tempat dengan sistem integrasi otomatis.

Berikut adalah panduan lengkap cara melakukan setup dan deploy proyek ini ke Railway.

---

## Langkah 1: Siapkan Akun Railway
1. Kunjungi website **[https://railway.app](https://railway.app/)**.
2. Daftar/Masuk menggunakan akun **GitHub** Anda.

---

## Langkah 2: Buat Project Baru & Tambahkan MySQL (1-Klik!)
1. Di Dashboard Railway, klik tombol **New Project** (Proyek Baru).
2. Pilih opsi **Provision MySQL** (Sediakan MySQL).
3. Railway akan membuatkan satu buah database MySQL online secara instan.
4. Klik pada kotak **MySQL** yang baru dibuat, lalu buka tab **Variables** untuk melihat kredensial database Anda (host, user, password, database).

---

## Langkah 3: Deploy Backend Node.js
1. Di halaman project yang sama, klik tombol **+ New** (di pojok kanan atas).
2. Pilih **GitHub Repo**, lalu pilih repositori proyek Anda (`raftrack-gemini`).
3. Setelah service ditambahkan, klik service repositori tersebut lalu masuk ke tab **Settings**:
   *   Cari bagian **General**, lalu pada **Root Directory**, isi dengan: `server` (ini memberitahu Railway untuk menjalankan folder server).
   *   Cari bagian **Deploy**, pastikan port dideteksi secara otomatis.

---

## Langkah 4: Hubungkan Server Backend ke MySQL Railway (Sangat Cerdas!)
Agar Server Backend Node.js Anda dapat berkomunikasi dengan Database MySQL Railway secara otomatis, masuk ke tab **Variables** pada service backend Anda, lalu tambahkan variabel berikut:

| Nama Variabel (Key) | Nilai Variabel (Value) | Keterangan |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Mode produksi |
| `JWT_SECRET` | `masukkan_kunci_acak_rahasia_anda` | Token generator secret |
| `DB_HOST` | `${{MySQL.MYSQLHOST}}` | Mengambil host MySQL otomatis |
| `DB_PORT` | `${{MySQL.MYSQLPORT}}` | Mengambil port MySQL otomatis |
| `DB_USER` | `${{MySQL.MYSQLUSER}}` | Mengambil username MySQL otomatis |
| `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` | Mengambil password MySQL otomatis |
| `DB_NAME` | `${{MySQL.MYSQLDATABASE}}` | Mengambil nama database otomatis |

> [!NOTE]
> Nilai `${{MySQL.MYSQLHOST}}` adalah fitur variabel referensi dinamis dari Railway. Dengan mengetikkan ini, Railway akan otomatis menyambungkan database Anda ke server backend tanpa perlu Anda menyalin password secara manual!

---

## Langkah 5: Aktifkan URL API Publik Backend Anda
1. Buka tab **Settings** pada service backend Anda di Railway.
2. Cari bagian **Networking** -> **Public Networking**.
3. Klik tombol **Generate Domain**.
4. Railway akan memberikan Anda URL API publik online, contoh: `https://raftrack-gemini-production.up.railway.app`.
5. Salin URL ini, karena ini adalah URL target API untuk Frontend Anda!

---

## Langkah 6: Deploy Frontend (Vite React) di Vercel (100% Gratis)
Untuk menghemat kuota Railway Anda, sangat disarankan mendeploy Frontend di **Vercel** karena 100% gratis selamanya.

1. Buka file `client/vite.config.js` di lokal komputer Anda. Ubah alamat target proxy `/api` ke alamat URL API publik Railway yang Anda dapatkan di Langkah 5:
   ```javascript
   // Ubah target ke URL API Railway Anda
   proxy: {
     '/api': {
       target: 'https://raftrack-gemini-production.up.railway.app', 
       changeOrigin: true,
       secure: false,
     }
   }
   ```
2. Lakukan git commit dan push kembali ke GitHub:
   ```bash
   git add .
   git commit -m "update: hubungkan frontend ke backend api online railway"
   git push origin main
   ```
3. Buka **Vercel**, import repositori GitHub Anda, set **Root Directory** ke `client` dan klik **Deploy**.
4. Website fintech futuristik Anda sekarang telah aktif sepenuhnya secara online, terhubung ke server backend Railway, dan menyimpan data secara nyata ke cloud database MySQL! 🚀🌌
