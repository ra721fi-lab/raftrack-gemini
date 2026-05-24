const db = require('../config/db');

class UserModel {
  // Mencari user berdasarkan username
  static async findByUsername(username) {
    const dbType = db.getDbType();
    if (dbType === 'mysql') {
      const pool = db.getPool();
      const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
      return rows[0] || null;
    } else {
      const data = db.readLokadata();
      const user = data.users.find(u => u.username === username);
      return user || null;
    }
  }

  // Mencari user berdasarkan email
  static async findByEmail(email) {
    const dbType = db.getDbType();
    if (dbType === 'mysql') {
      const pool = db.getPool();
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0] || null;
    } else {
      const data = db.readLokadata();
      const user = data.users.find(u => u.email === email);
      return user || null;
    }
  }

  // Mencari user berdasarkan ID
  static async findById(id) {
    const dbType = db.getDbType();
    if (dbType === 'mysql') {
      const pool = db.getPool();
      const [rows] = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = ?', [id]);
      return rows[0] || null;
    } else {
      const data = db.readLokadata();
      const user = data.users.find(u => u.id === Number(id));
      if (!user) return null;
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
  }

  // Membuat user baru
  static async create({ username, email, password }) {
    const dbType = db.getDbType();
    if (dbType === 'mysql') {
      const pool = db.getPool();
      const [result] = await pool.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, password]
      );
      return { id: result.insertId, username, email };
    } else {
      const data = db.readLokadata();
      const newId = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
      const newUser = {
        id: newId,
        username,
        email,
        password,
        created_at: new Date().toISOString()
      };
      data.users.push(newUser);
      db.writeLokadata(data);
      return { id: newId, username, email };
    }
  }
}

module.exports = UserModel;
