import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_URL, setCustomApiUrl, getApiUrl } from '../config';
import { Cpu, Mail, Lock, ShieldAlert, Sparkles, Server, CheckCircle2, AlertTriangle, RefreshCw, Settings, HelpCircle } from 'lucide-react';

const Login = ({ onNavigateToRegister }) => {
  const { login } = useContext(AuthContext);

  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  // Server health state
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking' | 'online' | 'offline'
  const [serverDetail, setServerDetail] = useState('');
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(() => localStorage.getItem('raftrack_api_url') || '');

  const checkServer = async () => {
    setServerStatus('checking');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      const res = await fetch(`${API_URL}/api/health`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setServerStatus('online');
        setServerDetail(`Database: ${data.dbType || 'Aktif'}`);
      } else {
        setServerStatus('offline');
        setServerDetail(`HTTP ${res.status}: Server tidak merespon health check`);
      }
    } catch (err) {
      setServerStatus('offline');
      setServerDetail('Tidak dapat terhubung ke server backend');
    }
  };

  useEffect(() => {
    checkServer();
  }, []);

  const handleSaveServerUrl = (e) => {
    e.preventDefault();
    setCustomApiUrl(customUrlInput);
  };

  const handlePresetUrl = (preset) => {
    setCustomUrlInput(preset);
    setCustomApiUrl(preset);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!identity || !password) {
      setLocalError('Harap lengkapi semua kolom');
      return;
    }

    setLoading(true);
    try {
      await login(identity, password);
    } catch (err) {
      setLocalError(err.message || 'Kombinasi password atau username salah.');
      // Jika server offline, otomatis buka panel info
      if (err.message && err.message.includes('server')) {
        setServerStatus('offline');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md font-sans">
      {/* Container utama dengan efek glassmorphism melayang */}
      <div 
        className="glass-panel border-white/5 p-6 sm:p-8 flex flex-col items-center relative overflow-hidden"
        style={{ boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)' }}
      >
        {/* Glow ambient decoration inside card */}
        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-neonBlue/15 rounded-full filter blur-xl"></div>
        <div className="absolute bottom-[-50px] left-[-50px] w-32 h-32 bg-neonPurple/15 rounded-full filter blur-xl"></div>

        {/* LOGO FINTECH */}
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-neonPurple to-neonBlue shadow-neon-purple p-[1px] mb-4">
          <div className="w-full h-full bg-darkSpace-900 rounded-[15px] flex items-center justify-center">
            <Cpu className="w-7 h-7 text-neonBlue neon-text-blue animate-pulse" />
          </div>
        </div>

        {/* TITLES */}
        <h2 className="text-xl font-bold tracking-widest text-slate-100 font-mono">
          RAFTRACK GEMINI
        </h2>
        <p className="text-xs text-slate-400 mt-1.5 tracking-wider uppercase font-mono">
          Akses Terminal Finansial AI
        </p>

        {/* STATUS SERVER PING BADGE */}
        <div className="mt-3 flex items-center gap-2">
          <div 
            onClick={() => setShowServerConfig(!showServerConfig)}
            className={`cursor-pointer px-3 py-1 rounded-full text-[11px] font-mono flex items-center gap-1.5 border transition-all ${
              serverStatus === 'online'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : serverStatus === 'checking'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300 animate-pulse'
            }`}
          >
            {serverStatus === 'online' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : serverStatus === 'checking' ? (
              <RefreshCw className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span>
              {serverStatus === 'online'
                ? 'Server Backend: Aktif'
                : serverStatus === 'checking'
                ? 'Memeriksa Server...'
                : 'Server Backend: Terputus'}
            </span>
            <Settings className="w-3 h-3 ml-1 opacity-70 hover:opacity-100" />
          </div>
          <button 
            type="button"
            onClick={checkServer}
            title="Refresh Status Server"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${serverStatus === 'checking' ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* SERVER CONFIG DRAWER / POPUP */}
        {showServerConfig && (
          <div className="w-full mt-3 p-3.5 rounded-xl border border-white/10 bg-darkSpace-800/90 text-xs text-slate-300 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5 font-mono">
                <Server className="w-3.5 h-3.5 text-neonBlue" /> Endpoint Backend API
              </span>
              <span className="text-[10px] text-slate-400">{serverDetail}</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Target saat ini: <code className="text-neonBlue font-mono">{API_URL || '(Proxy Lokal / dev)'}</code>
            </p>

            <form onSubmit={handleSaveServerUrl} className="flex gap-2 mt-2">
              <input 
                type="text"
                placeholder="Contoh: http://localhost:5000"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs bg-darkSpace-900 border border-white/10 rounded-lg text-slate-200 font-mono focus:border-neonBlue outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-neonBlue/20 text-neonBlue border border-neonBlue/40 rounded-lg hover:bg-neonBlue/30 text-xs font-semibold"
              >
                Simpan
              </button>
            </form>

            <div className="flex items-center gap-1.5 pt-1 text-[10px]">
              <span className="text-slate-500">Preset:</span>
              <button 
                type="button" 
                onClick={() => handlePresetUrl('')}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300"
              >
                Dev Proxy
              </button>
              <button 
                type="button" 
                onClick={() => handlePresetUrl('http://localhost:5000')}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300"
              >
                Port 5000
              </button>
            </div>

            {serverStatus === 'offline' && (
              <div className="mt-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded text-[11px] text-rose-300 flex items-start gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-rose-400" />
                <span>
                  Pastikan server backend sudah berjalan di terminal Anda dengan menjalankan perintah: <br />
                  <code className="text-white font-mono bg-black/40 px-1 py-0.5 rounded">cd server && npm start</code>
                </span>
              </div>
            )}
          </div>
        )}

        {/* ERROR DISPLAY */}
        {localError && (
          <div className="w-full mt-4 p-3.5 border border-neonRed/30 rounded-xl bg-neonRed/10 flex items-start gap-2.5 shadow-neon-red/10 animate-pulse">
            <ShieldAlert className="w-4 h-4 text-neonRed flex-shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-neonRed tracking-wide leading-relaxed">
              {localError}
            </p>
          </div>
        )}

        {/* FORM LOGIN */}
        <form onSubmit={handleSubmit} className="w-full mt-5 flex flex-col gap-4">
          {/* Username / Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest pl-1">
              Username atau Alamat Email
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Masukkan username atau email..."
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 text-sm glass-input focus:border-neonBlue focus:shadow-neon-blue"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest pl-1">
              Kata Sandi Terminal
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder="Masukkan kata sandi..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 text-sm glass-input focus:border-neonPurple focus:shadow-neon-purple"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl font-bold text-sm bg-gradient-to-tr from-neonPurple to-neonBlue text-white shadow-neon-purple hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-t-white border-r-white/30 rounded-full animate-spin"></div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyanGlow" />
                <span>Masuk ke Protokol</span>
              </>
            )}
          </button>
        </form>

        {/* SWITCH REGISTRATION */}
        <p className="mt-8 text-xs text-slate-500 tracking-wide font-mono">
          Belum terdaftar?{' '}
          <button
            onClick={onNavigateToRegister}
            className="text-neonBlue hover:text-neonBlue/80 font-bold hover:underline transition-colors ml-1"
          >
            Buat Akun Baru &rarr;
          </button>
        </p>

      </div>
    </div>
  );
};

export default Login;
