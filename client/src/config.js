// ========================================================
// KONFIGURASI SINKRONISASI API FRONTEND & BACKEND
// ========================================================

export const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('raftrack_api_url');
    if (customUrl) return customUrl.trim().replace(/\/$/, '');
    if (!import.meta.env.DEV) {
      return import.meta.env.VITE_API_URL || window.location.origin;
    }
  }
  return import.meta.env.DEV
    ? '' // Menggunakan proxy Vite lokal pada saat Development
    : (import.meta.env.VITE_API_URL || 'http://150.109.19.197');
};

export const setCustomApiUrl = (url) => {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      localStorage.setItem('raftrack_api_url', url.trim().replace(/\/$/, ''));
    } else {
      localStorage.removeItem('raftrack_api_url');
    }
    window.location.reload();
  }
};

export const API_URL = getApiUrl();
