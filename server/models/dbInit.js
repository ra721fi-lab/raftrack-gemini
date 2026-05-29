const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function initializeDatabase() {
  if (db.getDbType() !== 'mysql') {
    // Jika menggunakan Lokadata (JSON), migrasi sudah selesai saat db.js memanggil initLokadata()
    console.log('[Lokadata Init] Database fallback JSON sudah siap.');
    return;
  }

  const pool = db.getPool();
  try {
    const schemaPath = path.join(__dirname, '../schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.warn(`[MySQL Init] File schema.sql tidak ditemukan di: ${schemaPath}`);
      return;
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Membersihkan komentar SQL agar query bisa dieksekusi dengan bersih
    const cleanedSql = schemaSql
      .replace(/--.*\n/g, '') // Hapus komentar baris ganda (--)
      .replace(/\/\*[\s\S]*?\*\//g, ''); // Hapus komentar blok (/* */)

    // Membagi script SQL berdasarkan semicolon (;) di akhir baris
    const queries = cleanedSql
      .split(/;[ \t]*\r?\n/)
      .map(query => query.trim())
      .filter(query => query.length > 0);

    console.log(`[MySQL Init] Menjalankan ${queries.length} instruksi migrasi skema database...`);
    for (const query of queries) {
      await pool.query(query);
    }
    
    // Cek dan tambahkan kolom payment_source ke tabel transactions jika belum ada (skema migrasi)
    try {
      const [columns] = await pool.query("SHOW COLUMNS FROM `transactions` LIKE 'payment_source'");
      if (columns.length === 0) {
        console.log("[MySQL Migration] Menambahkan kolom 'payment_source' ke tabel 'transactions'...");
        await pool.query("ALTER TABLE `transactions` ADD COLUMN `payment_source` VARCHAR(50) NOT NULL DEFAULT 'cash'");
        console.log("[MySQL Migration] Kolom 'payment_source' berhasil ditambahkan.");
      }
    } catch (migErr) {
      console.warn("[MySQL Migration] Peringatan saat memeriksa/menambahkan kolom 'payment_source':", migErr.message);
    }

    console.log('[MySQL Init] Migrasi skema & seeding kategori default berhasil diselesaikan.');
  } catch (error) {
    console.error('[MySQL Init] Gagal menjalankan inisialisasi skema database:', error);
  }
}

module.exports = {
  initializeDatabase
};
