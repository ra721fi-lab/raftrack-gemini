import React, { useContext, useState } from 'react';
import { AuthContext } from './context/AuthContext';
import { TransactionContext } from './context/TransactionContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AIChatbot from './components/AIChatbot';
import Toast from './components/Toast';
import { AlertCircle } from 'lucide-react';

function App() {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const { toasts } = useContext(TransactionContext);
  
  // State halaman yang aktif di dalam Dashboard
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' atau 'transactions'
  const [isRegister, setIsRegister] = useState(false);

  // Tampilan loading bergaya futuristik premium
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-darkSpace-900 text-slate-100">
        <div className="relative w-24 h-24 mb-6">
          {/* Glowing neon circular spinner */}
          <div className="absolute inset-0 border-4 border-neonPurple/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-neonBlue border-r-neonBlue rounded-full animate-spin neon-glow-blue"></div>
          <div className="absolute inset-4 border-2 border-t-cyanGlow border-l-cyanGlow rounded-full animate-spin duration-1000"></div>
        </div>
        <h2 className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-neonPurple animate-pulse-slow">
          RAFTRACK GEMINI AI
        </h2>
        <p className="mt-2 text-xs tracking-wider text-slate-400 font-mono">
          MENGHUBUNGKAN KE PROTOKOL FINTECH...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-slate-100 transition-colors duration-300 relative overflow-hidden">
      {/* Background Neon Blobs */}
      <div className="ambient-glow-purple top-[-100px] left-[-100px] animate-pulse-slow"></div>
      <div className="ambient-glow-blue bottom-[-150px] right-[-150px] animate-pulse-slow duration-5000"></div>

      {/* Komponen Toast Notifikasi Global */}
      <Toast toasts={toasts} />

      {!isAuthenticated ? (
        // Halaman login / register jika belum terautentikasi
        <div className="min-h-screen flex items-center justify-center p-4">
          {isRegister ? (
            <Register onNavigateToLogin={() => setIsRegister(false)} />
          ) : (
            <Login onNavigateToRegister={() => setIsRegister(true)} />
          )}
        </div>
      ) : (
        // Tampilan aplikasi utama setelah masuk
        <div className="flex min-h-screen flex-col lg:flex-row relative">
          {/* Sidebar elegan melayang */}
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Area Konten Utama */}
          <div className="flex-1 flex flex-col p-4 lg:p-6 lg:pl-0 max-w-7xl mx-auto w-full lg:h-screen lg:overflow-y-auto">
            {/* Header navigasi atas (jam, user profile, dll.) */}
            <Header />

            {/* Halaman yang sedang aktif */}
            <main className="flex-grow py-4">
              {activeTab === 'dashboard' ? (
                <Dashboard setActiveTab={setActiveTab} />
              ) : (
                <Transactions />
              )}
            </main>
          </div>

          {/* Floating AI Chatbot Assistant di pojok kanan bawah */}
          <AIChatbot />
        </div>
      )}
    </div>
  );
}

export default App;
