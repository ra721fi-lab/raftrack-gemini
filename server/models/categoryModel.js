const db = require('../config/db');

class CategoryModel {
  // Mendapatkan semua kategori
  static async getAll() {
    const dbType = db.getDbType();
    if (dbType === 'mysql') {
      const pool = db.getPool();
      const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
      return rows;
    } else {
      const data = db.readLokadata();
      return data.categories || [];
    }
  }

  // Mencari kategori berdasarkan ID
  static async findById(id) {
    const dbType = db.getDbType();
    if (dbType === 'mysql') {
      const pool = db.getPool();
      const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
      return rows[0] || null;
    } else {
      const data = db.readLokadata();
      const category = data.categories.find(c => c.id === Number(id));
      return category || null;
    }
  }

  // Mencari kategori berdasarkan nama
  static async findByName(name) {
    const dbType = db.getDbType();
    if (dbType === 'mysql') {
      const pool = db.getPool();
      const [rows] = await pool.query('SELECT * FROM categories WHERE name = ?', [name.toLowerCase().trim()]);
      return rows[0] || null;
    } else {
      const data = db.readLokadata();
      const category = data.categories.find(c => c.name.toLowerCase() === name.toLowerCase().trim());
      return category || null;
    }
  }
}

module.exports = CategoryModel;
