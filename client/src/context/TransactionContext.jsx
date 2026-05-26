import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { API_URL } from '../config';

export const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const { token, isAuthenticated } = useContext(AuthContext);
  
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State filter pencarian & kategori
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    type: '',
    startDate: '',
    endDate: ''
  });

  // Notifikasi Toast Global
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // 1. Fetch data semua transaksi berdasarkan filter
  const fetchTransactions = async () => {
    if (!isAuthenticated || !token) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.category_id) queryParams.append('category_id', filters.category_id);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const response = await fetch(`${API_URL}/api/transactions?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error('[Transaction Context] Gagal memuat transaksi:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch statistik & AI insight keuangan
  const fetchStats = async () => {
    if (!isAuthenticated || !token) return;
    setStatsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/analytics/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('[Transaction Context] Gagal memuat statistik:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Jalankan fetch otomatis saat login atau ketika filter berubah
  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
      fetchStats();
    } else {
      setTransactions([]);
      setStats(null);
    }
  }, [isAuthenticated, filters]);

  // 3. Tambah Transaksi
  const addTransaction = async (txData) => {
    try {
      const response = await fetch(`${API_URL}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(txData)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal menambahkan transaksi');
      }
      
      addToast(data.message || 'Transaksi berhasil dicatat!', 'success');
      
      // Muat ulang data
      await fetchTransactions();
      await fetchStats();
      return data;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  // 4. Edit Transaksi
  const editTransaction = async (id, txData) => {
    try {
      const response = await fetch(`${API_URL}/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(txData)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal memperbarui transaksi');
      }
      
      addToast('Transaksi berhasil diperbarui!', 'success');
      
      // Muat ulang data
      await fetchTransactions();
      await fetchStats();
      return data;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  // 5. Hapus Transaksi
  const deleteTransaction = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal menghapus transaksi');
      }
      
      addToast('Transaksi berhasil dihapus!', 'info');
      
      // Muat ulang data
      await fetchTransactions();
      await fetchStats();
      return data;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  // 6. Kirim Pesan ke AI Chatbot
  const sendChatToAI = async (message) => {
    try {
      const response = await fetch(`${API_URL}/api/analytics/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal menghubungi chatbot AI');
      }
      return data.reply;
    } catch (err) {
      console.error('[Chat AI Error]:', err);
      return 'Maaf, sistem AI sedang sibuk. Silakan coba kirim pesan beberapa saat lagi.';
    }
  };

  // 7. Unduh Laporan CSV
  const downloadCSV = () => {
    if (!token) return;
    window.open(`${API_URL}/api/export/csv?token=${token}`, '_self');
    // Alternatif jika butuh header Authorization eksplisit:
    fetch(`${API_URL}/api/export/csv`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `raftrack_laporan_${new Date().toISOString().substring(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      addToast('File CSV berhasil diunduh!', 'success');
    })
    .catch(err => addToast('Gagal mengunduh CSV', 'error'));
  };

  // States untuk kontrol Drawer & OCR secara global (mempermudah pemanggilan dari Sidebar)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);
  const [editingTransactionData, setEditingTransactionData] = useState(null);

  return (
    <TransactionContext.Provider value={{
      transactions,
      stats,
      loading,
      statsLoading,
      filters,
      setFilters,
      toasts,
      addToast,
      addTransaction,
      editTransaction,
      deleteTransaction,
      sendChatToAI,
      downloadCSV,
      isDrawerOpen,
      setIsDrawerOpen,
      isOCRModalOpen,
      setIsOCRModalOpen,
      editingTransactionData,
      setEditingTransactionData,
      refreshData: () => { fetchTransactions(); fetchStats(); }
    }}>
      {children}
    </TransactionContext.Provider>
  );
};
