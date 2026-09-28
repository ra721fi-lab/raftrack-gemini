import React, { createContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('raftrack_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('raftrack_token') || null);
  const [loading, setLoading] = useState(() => {
    // Jika data user sudah ada di localStorage, jangan gantung layar dengan loading
    return !!(localStorage.getItem('raftrack_token') && !localStorage.getItem('raftrack_user'));
  });
  const [error, setError] = useState(null);

  // Periksa keabsahan session token saat pertama kali aplikasi dibuka
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('raftrack_user', JSON.stringify(data.user));
          }
        } else if (response.status === 401 || response.status === 403) {
          // Hanya logout jika token memang benar-benar ditolak / kadaluarsa oleh server
          console.warn('[Auth Context] Token kadaluarsa atau ditolak server, melakukan logout.');
          logout();
        } else {
          console.warn(`[Auth Context] Server merespon status ${response.status}, sesi lokal tetap dipertahankan.`);
        }
      } catch (err) {
        // JANGAN LOGOUT HANYA KARENA MASALAH JARINGAN / SERVER OFFLINE!
        console.warn('[Auth Context] Tidak dapat menghubungi server profil (offline/cold start), mempertahankan sesi lokal:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Handler Login
  const login = async (identity, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identity, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal masuk, kredensial salah.');
      }

      localStorage.setItem('raftrack_token', data.user.token);
      localStorage.setItem('raftrack_user', JSON.stringify(data.user));
      setToken(data.user.token);
      setUser(data.user);
      return data;
    } catch (err) {
      const msg = err.message === 'Failed to fetch' || err.name === 'TypeError'
        ? 'Tidak dapat terhubung ke server backend. Pastikan server aktif (port 5000) atau periksa koneksi internet.'
        : (err.message || 'Gagal masuk, kredensial salah.');
      setError(msg);
      throw new Error(msg);
    }
  };

  // Handler Register
  const register = async (username, email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal mendaftar akun baru.');
      }

      localStorage.setItem('raftrack_token', data.user.token);
      localStorage.setItem('raftrack_user', JSON.stringify(data.user));
      setToken(data.user.token);
      setUser(data.user);
      return data;
    } catch (err) {
      const msg = err.message === 'Failed to fetch' || err.name === 'TypeError'
        ? 'Tidak dapat terhubung ke server backend. Pastikan server aktif (port 5000) atau periksa koneksi internet.'
        : (err.message || 'Gagal mendaftar akun baru.');
      setError(msg);
      throw new Error(msg);
    }
  };

  // Handler Logout
  const logout = () => {
    localStorage.removeItem('raftrack_token');
    localStorage.removeItem('raftrack_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
