const db = require('../config/db');
const CategoryModel = require('./categoryModel');

class TransactionModel {
  // Membuat transaksi baru
  static async create({ user_id, category_id, type, amount, description, date, receipt_img, payment_source }) {
    const dbType = db.getDbType();
    const source = payment_source || 'cash';
    if (dbType === 'mysql') {
      const pool = db.getPool();
      const [result] = await pool.query(
        'INSERT INTO transactions (user_id, category_id, type, amount, description, date, receipt_img, payment_source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user_id, category_id, type, amount, description, date, receipt_img || null, source]
      );
      return { id: result.insertId, user_id, category_id, type, amount, description, date, receipt_img, payment_source: source };
    } else {
      const data = db.readLokadata();
      const newId = data.transactions.length > 0 ? Math.max(...data.transactions.map(t => t.id)) + 1 : 1;
      const newTransaction = {
        id: newId,
        user_id: Number(user_id),
        category_id: Number(category_id),
        type,
        amount: Number(amount),
        description,
        date,
        receipt_img: receipt_img || null,
        payment_source: source,
        created_at: new Date().toISOString()
      };
      data.transactions.push(newTransaction);
      db.writeLokadata(data);
      return newTransaction;
    }
  }

  // Mendapatkan semua transaksi dengan filter
  static async getAll(user_id, filters = {}) {
    const dbType = db.getDbType();
    const { search, category_id, type, startDate, endDate } = filters;

    if (dbType === 'mysql') {
      const pool = db.getPool();
      let sql = `
        SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon 
        FROM transactions t 
        JOIN categories c ON t.category_id = c.id 
        WHERE t.user_id = ?
      `;
      const params = [user_id];

      if (search) {
        sql += ' AND t.description LIKE ?';
        params.push(`%${search}%`);
      }
      if (category_id) {
        sql += ' AND t.category_id = ?';
        params.push(Number(category_id));
      }
      if (type) {
        sql += ' AND t.type = ?';
        params.push(type);
      }
      if (startDate) {
        sql += ' AND t.date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        sql += ' AND t.date <= ?';
        params.push(endDate);
      }

      sql += ' ORDER BY t.date DESC, t.id DESC';
      const [rows] = await pool.query(sql, params);
      return rows;
    } else {
      const data = db.readLokadata();
      let transactions = data.transactions.filter(t => t.user_id === Number(user_id));

      if (search) {
        const query = search.toLowerCase();
        transactions = transactions.filter(t => t.description && t.description.toLowerCase().includes(query));
      }
      if (category_id) {
        transactions = transactions.filter(t => t.category_id === Number(category_id));
      }
      if (type) {
        transactions = transactions.filter(t => t.type === type);
      }
      if (startDate) {
        transactions = transactions.filter(t => t.date >= startDate);
      }
      if (endDate) {
        transactions = transactions.filter(t => t.date <= endDate);
      }

      // Gabungkan detail kategori
      const enrichedTransactions = transactions.map(t => {
        const category = data.categories.find(c => c.id === t.category_id) || {
          name: 'lainnya',
          color: '#a0aec0',
          icon: 'HelpCircle'
        };
        return {
          ...t,
          category_name: category.name,
          category_color: category.color,
          category_icon: category.icon
        };
      });

      // Urutkan berdasarkan tanggal descending
      return enrichedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);
    }
  }

  // Mendapatkan satu transaksi berdasarkan ID
  static async findById(id) {
    const dbType = db.getDbType();
    if (dbType === 'mysql') {
      const pool = db.getPool();
      const [rows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [id]);
      return rows[0] || null;
    } else {
      const data = db.readLokadata();
      const transaction = data.transactions.find(t => t.id === Number(id));
      return transaction || null;
    }
  }

  // Mengubah data transaksi
  static async update(id, { category_id, type, amount, description, date, receipt_img, payment_source }) {
    const dbType = db.getDbType();
    if (dbType === 'mysql') {
      const pool = db.getPool();
      await pool.query(
        'UPDATE transactions SET category_id = ?, type = ?, amount = ?, description = ?, date = ?, receipt_img = COALESCE(?, receipt_img), payment_source = ? WHERE id = ?',
        [category_id, type, amount, description, date, receipt_img || null, payment_source || 'cash', id]
      );
      return this.findById(id);
    } else {
      const data = db.readLokadata();
      const index = data.transactions.findIndex(t => t.id === Number(id));
      if (index === -1) return null;

      data.transactions[index] = {
        ...data.transactions[index],
        category_id: Number(category_id),
        type,
        amount: Number(amount),
        description,
        date,
        receipt_img: receipt_img !== undefined ? receipt_img : data.transactions[index].receipt_img,
        payment_source: payment_source || data.transactions[index].payment_source || 'cash'
      };

      db.writeLokadata(data);
      return data.transactions[index];
    }
  }

  // Menghapus transaksi
  static async delete(id) {
    const dbType = db.getDbType();
    if (dbType === 'mysql') {
      const pool = db.getPool();
      const [result] = await pool.query('DELETE FROM transactions WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } else {
      const data = db.readLokadata();
      const initialLength = data.transactions.length;
      data.transactions = data.transactions.filter(t => t.id !== Number(id));
      db.writeLokadata(data);
      return data.transactions.length < initialLength;
    }
  }

  // Mengambil ringkasan statistik keuangan
  static async getStats(user_id) {
    const dbType = db.getDbType();
    
    if (dbType === 'mysql') {
      const pool = db.getPool();
      
      // 1. Total Saldo, Pemasukan, Pengeluaran
      const [totals] = await pool.query(`
        SELECT 
          SUM(CASE WHEN type = 'pemasukan' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'pengeluaran' THEN amount ELSE 0 END) as total_expense
        FROM transactions 
        WHERE user_id = ?
      `, [user_id]);

      const totalIncome = parseFloat(totals[0].total_income || 0);
      const totalExpense = parseFloat(totals[0].total_expense || 0);
      const balance = totalIncome - totalExpense;

      // 1.5. Saldo Akun Terpisah (Bank, Wallet, Cash)
      const [accountTotals] = await pool.query(`
        SELECT 
          payment_source,
          SUM(CASE WHEN type = 'pemasukan' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'pengeluaran' THEN amount ELSE 0 END) as expense
        FROM transactions 
        WHERE user_id = ?
        GROUP BY payment_source
      `, [user_id]);

      let bankBalance = 0;
      let walletBalance = 0;
      let cashBalance = 0;

      accountTotals.forEach(row => {
        const bal = parseFloat(row.income || 0) - parseFloat(row.expense || 0);
        const src = row.payment_source || 'cash';
        if (src === 'bank') bankBalance = bal;
        else if (src === 'wallet') walletBalance = bal;
        else if (src === 'cash') cashBalance = bal;
      });

      // 2. Pengeluaran per Kategori
      const [categoryBreakdown] = await pool.query(`
        SELECT 
          c.name as category_name, 
          c.color as category_color, 
          c.icon as category_icon,
          SUM(t.amount) as total_amount
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ? AND t.type = 'pengeluaran'
        GROUP BY c.id
        ORDER BY total_amount DESC
      `, [user_id]);

      // 3. Tren Bulanan (6 bulan terakhir)
      const [monthlyTrend] = await pool.query(`
        SELECT 
          DATE_FORMAT(date, '%Y-%m') as month,
          SUM(CASE WHEN type = 'pemasukan' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'pengeluaran' THEN amount ELSE 0 END) as expense
        FROM transactions
        WHERE user_id = ?
        GROUP BY DATE_FORMAT(date, '%Y-%m')
        ORDER BY month ASC
        LIMIT 6
      `, [user_id]);

      return {
        balance,
        totalIncome,
        totalExpense,
        bankBalance,
        walletBalance,
        cashBalance,
        categoryBreakdown: categoryBreakdown.map(c => ({
          name: c.category_name,
          color: c.category_color,
          icon: c.category_icon,
          value: parseFloat(c.total_amount || 0)
        })),
        monthlyTrend: monthlyTrend.map(t => ({
          name: t.month,
          pemasukan: parseFloat(t.income || 0),
          pengeluaran: parseFloat(t.expense || 0)
        }))
      };
    } else {
      const data = db.readLokadata();
      const transactions = data.transactions.filter(t => t.user_id === Number(user_id));

      let totalIncome = 0;
      let totalExpense = 0;

      transactions.forEach(t => {
        if (t.type === 'pemasukan') {
          totalIncome += t.amount;
        } else {
          totalExpense += t.amount;
        }
      });

      const balance = totalIncome - totalExpense;

      // Saldo Akun Terpisah (Bank, Wallet, Cash) untuk Lokadata
      let bankBalance = 0;
      let walletBalance = 0;
      let cashBalance = 0;

      transactions.forEach(t => {
        const amt = t.amount;
        const src = t.payment_source || 'cash';
        const isInc = t.type === 'pemasukan';

        if (src === 'bank') {
          bankBalance += isInc ? amt : -amt;
        } else if (src === 'wallet') {
          walletBalance += isInc ? amt : -amt;
        } else {
          cashBalance += isInc ? amt : -amt;
        }
      });

      // Pengeluaran per kategori
      const categoryMap = {};
      transactions
        .filter(t => t.type === 'pengeluaran')
        .forEach(t => {
          const category = data.categories.find(c => c.id === t.category_id) || {
            name: 'lainnya',
            color: '#a0aec0',
            icon: 'HelpCircle'
          };
          if (!categoryMap[category.name]) {
            categoryMap[category.name] = {
              name: category.name,
              color: category.color,
              icon: category.icon,
              value: 0
            };
          }
          categoryMap[category.name].value += t.amount;
        });

      const categoryBreakdown = Object.values(categoryMap).sort((a, b) => b.value - a.value);

      // Tren bulanan
      const monthlyMap = {};
      transactions.forEach(t => {
        const month = t.date.substring(0, 7); // 'YYYY-MM'
        if (!monthlyMap[month]) {
          monthlyMap[month] = { name: month, pemasukan: 0, pengeluaran: 0 };
        }
        if (t.type === 'pemasukan') {
          monthlyMap[month].pemasukan += t.amount;
        } else {
          monthlyMap[month].pengeluaran += t.amount;
        }
      });

      const monthlyTrend = Object.values(monthlyMap)
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(-6);

      return {
        balance,
        totalIncome,
        totalExpense,
        bankBalance,
        walletBalance,
        cashBalance,
        categoryBreakdown,
        monthlyTrend
      };
    }
  }
}

module.exports = TransactionModel;
