import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Cpu, Mail, Lock, ShieldAlert, Sparkles } from 'lucide-react';

const Login = ({ onNavigateToRegister }) => {
  const { login } = useContext(AuthContext);

  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

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

        {/* ERROR DISPLAY */}
        {localError && (
          <div className="w-full mt-6 p-3.5 border border-neonRed/30 rounded-xl bg-neonRed/10 flex items-start gap-2.5 shadow-neon-red/10 animate-pulse">
            <ShieldAlert className="w-4 h-4 text-neonRed flex-shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-neonRed tracking-wide leading-relaxed">
              {localError}
            </p>
          </div>
        )}

        {/* FORM LOGIN */}
        <form onSubmit={handleSubmit} className="w-full mt-6 flex flex-col gap-4">
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
