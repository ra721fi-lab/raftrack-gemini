import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Clock, ShieldAlert, Wifi, Database } from 'lucide-react';
import { API_URL } from '../config';

const Header = () => {
  const { user } = useContext(AuthContext);
  
  // State untuk jam digital real-time
  const [time, setTime] = useState(new Date());
  const [dbType, setDbType] = useState('MYSQL');

  useEffect(() => {
    // Jalankan interval jam setiap detik
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Dapatkan status database dari server health
    fetch(`${API_URL}/api/health`)
      .then(res => res.json())
      .then(data => {
        if (data && data.dbType) {
          setDbType(data.dbType.toUpperCase());
        }
      })
      .catch(() => {
        // Fallback jika tidak terkoneksi ke API
        setDbType('UNKNOWN');
      });

    return () => clearInterval(timer);
  }, []);

  // Format tanggal bahasa Indonesia
  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  // Format jam dengan detik
  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <header className="hidden lg:flex w-full mb-6 flex-row items-center justify-between gap-4 p-4 glass-panel border-white/5">
      {/* KIRI: Sapaan User & Tanggal */}
      <div>
        <p className="text-xs font-mono text-neonBlue tracking-widest uppercase">
          PROTOKOL ANALISIS DIMULAI
        </p>
        <h2 className="text-xl font-bold tracking-tight text-slate-100 mt-0.5">
          Selamat {time.getHours() < 12 ? 'Pagi' : time.getHours() < 17 ? 'Siang' : 'Malam'},{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-neonPurple">
            {user ? user.username : 'User'}
          </span>
        </h2>
      </div>

      {/* KANAN: Real-time Clock & System Status */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        {/* JAM REAL-TIME */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/30 border border-white/5 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-neonPurple neon-text-purple" />
          <span className="font-semibold tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">
            {formatTime(time)}
          </span>
        </div>

        {/* DATABASE STATUS INDICATOR */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-black/30 ${
          dbType === 'MYSQL' 
            ? 'border-cyanGlow/20 text-cyanGlow' 
            : 'border-amber-500/20 text-amber-500'
        }`}>
          <Database className="w-3.5 h-3.5" />
          <span>DB: {dbType}</span>
        </div>

        {/* STATUS KONEKSI SYSTEM */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/30 border border-cyanGlow/20 text-cyanGlow">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyanGlow opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyanGlow"></span>
          </span>
          <span>SYS_ONLINE</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
