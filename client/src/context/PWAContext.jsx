import React, { createContext, useState, useEffect } from 'react';

export const PWAContext = createContext();

export const PWAProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Deteksi apakah perangkat adalah iOS (iPhone/iPad/iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const detectIOS = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    setIsIOS(detectIOS);

    // 2. Cek apakah sudah berjalan dalam mode standalone (aplikasi terinstal)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
      setIsInstallable(false);
      return;
    }

    // 3. Tangkap event 'beforeinstallprompt' (Chrome, Edge, Opera, Samsung Internet, Android)
    const handleBeforeInstallPrompt = (e) => {
      // Cegah banner otomatis bawaan browser agar kita bisa memicu dari UI kita
      e.preventDefault();
      // Simpan event untuk dipicu nanti
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log('PWA: beforeinstallprompt dipicu dan disimpan.');
    };

    // 4. Tangkap event ketika aplikasi berhasil diinstal
    const handleAppInstalled = () => {
      console.log('PWA: Aplikasi berhasil dipasang!');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowInstallGuide(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Tambahan deteksi alternatif untuk iOS: jika iOS dan tidak standalone, maka bisa diinstal secara manual
    if (detectIOS && !isStandalone) {
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    // Jika berjalan di iOS, buka modal petunjuk manual
    if (isIOS) {
      setShowInstallGuide(true);
      return;
    }

    // Jika memiliki deferredPrompt (Android/PC Chrome/Edge)
    if (deferredPrompt) {
      deferredPrompt.prompt();
      
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA: Hasil prompt pengguna: ${outcome}`);
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } else {
      // Fallback jika tidak ada prompt native tapi terdeteksi dapat dipasang (misal manual tutorial)
      setShowInstallGuide(true);
    }
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isIOS,
        showInstallGuide,
        setShowInstallGuide,
        installApp
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};
