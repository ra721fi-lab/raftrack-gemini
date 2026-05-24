const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let pool = null;
let dbType = 'mysql'; // 'mysql' atau 'lokadata'
const LOKADATA_FILE = path.join(__dirname, '../models/lokadata.json');

// Banner visual untuk log terminal
function printBanner(title, messages, isError = false) {
  const border = '='.repeat(60);
  console.log('\n' + border);
  console.log(`* ${title.toUpperCase().padEnd(56)} *`);
  console.log(border);
  messages.forEach(msg => console.log(`| ${msg.padEnd(56)} |`));
  console.log(border + '\n');
}

// Inisialisasi Lokadata (JSON Fallback)
function initLokadata() {
  if (!fs.existsSync(LOKADATA_FILE)) {
    const defaultData = {
      users: [],
      categories: [
        { id: 1, name: 'makanan', type: 'pengeluaran', color: '#ff007f', icon: 'Utensils' },
        { id: 2, name: 'transportasi', type: 'pengeluaran', color: '#00f2fe', icon: 'Car' },
        { id: 3, name: 'tagihan', type: 'pengeluaran', color: '#ffd000', icon: 'CreditCard' },
        { id: 4, name: 'hiburan', type: 'pengeluaran', color: '#b92bff', icon: 'Gamepad2' },
        { id: 5, name: 'investasi', type: 'pengeluaran', color: '#00ff87', icon: 'TrendingUp' },
        { id: 6, name: 'gaji', type: 'pemasukan', color: '#05c1ff', icon: 'DollarSign' },
        { id: 7, name: 'lainnya', type: 'pengeluaran', color: '#a0aec0', icon: 'HelpCircle' }
      ],
      transactions: []
    };
    fs.mkdirSync(path.dirname(LOKADATA_FILE), { recursive: true });
    fs.writeFileSync(LOKADATA_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
  }
}

// Fungsi untuk menghubungkan ke database MySQL
async function connectDB() {
  try {
    // Coba membuat koneksi sementara untuk memverifikasi apakah MySQL server menyala dan kredensial benar
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || 3306, 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    // Coba membuat database jika belum ada
    const dbName = process.env.DB_NAME || 'raftrack_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();

    // Buat pooling koneksi utama ke database target
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || 3306, 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    dbType = 'mysql';
    printBanner('MySQL Terhubung', [
      'Koneksi MySQL berhasil dibangun.',
      `Host: ${process.env.DB_HOST || 'localhost'}`,
      `Database: ${dbName}`,
      'Aplikasi berjalan dalam mode MySQL Production.'
    ]);

    return pool;
  } catch (error) {
    dbType = 'lokadata';
    initLokadata();
    printBanner('Fallback Lokadata Aktif', [
      'Gagal menghubungkan ke MySQL database server.',
      'Sistem secara otomatis mengaktifkan database lokal JSON (Lokadata).',
      'Data transaksi Anda akan disimpan permanen di:',
      `server/models/lokadata.json`,
      'Semua fitur aplikasi 100% berjalan normal.'
    ]);
    return null;
  }
}

// Fungsi pembantu untuk membaca dan menulis Lokadata JSON
function readLokadata() {
  initLokadata();
  const data = fs.readFileSync(LOKADATA_FILE, 'utf8');
  return JSON.parse(data);
}

function writeLokadata(data) {
  fs.writeFileSync(LOKADATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  connectDB,
  getPool: () => pool,
  getDbType: () => dbType,
  readLokadata,
  writeLokadata
};
