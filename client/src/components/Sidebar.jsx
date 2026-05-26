import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { TransactionContext } from '../context/TransactionContext';
import { LayoutDashboard, History, LogOut, Cpu, Sun, Moon, Camera, Plus } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout, user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { setIsDrawerOpen, setIsOCRModalOpen, setEditingTransactionData } = useContext(TransactionContext);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Riwayat', icon: History }
  ];

  const mobileMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, type: 'tab' },
    { id: 'scan', label: 'Scan', icon: Camera, type: 'action', onClick: () => { setActiveTab('transactions'); setIsOCRModalOpen(true); } },
    { id: 'add', label: 'Manual', icon: Plus, type: 'action', onClick: () => { setActiveTab('transactions'); setEditingTransactionData(null); setIsDrawerOpen(true); } },
    { id: 'transactions', label: 'Riwayat', icon: History, type: 'tab' }
  ];

  return (
    <>
      {/* ========================================================
         1. MOBILE HEADER & BOTTOM NAV (UNTUK HP)
         ======================================================== */}
      {/* Mobile Top Header (Sticky Top) */}
      <div className="lg:hidden w-full flex items-center justify-between p-4 glass-panel border-white/5 rounded-b-2xl rounded-t-none sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-neonPurple to-neonBlue p-[1px]">
            <div className="w-full h-full bg-darkSpace-900 rounded-[7px] flex items-center justify-center">
              <Cpu className="w-4 h-4 text-neonBlue" />
            </div>
          </div>
          <span className="text-xs font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-neonPurple font-mono">
            RAFTRACK
          </span>
        </div>

        {/* User initials & Toggle Theme & Logout on Mobile */}
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono text-slate-400 capitalize truncate max-w-[80px]">
            {user ? user.username : 'User'}
          </span>
          
          {/* Theme Toggle Button Mobile */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-slate-200 transition-all"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-neonBlue" /> : <Moon className="w-3.5 h-3.5 text-neonPurple" />}
          </button>

          <button
            onClick={logout}
            title="Keluar"
            className="p-1.5 rounded-lg border border-neonRed/20 bg-neonRed/5 text-neonRed hover:bg-neonRed/10 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Floating Pill) */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
        <div className="glass-panel border-white/10 bg-darkSpace-800/80 backdrop-blur-lg rounded-2xl flex justify-around items-center p-2 shadow-2xl">
          {mobileMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.type === 'tab' && activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={item.type === 'tab' ? () => setActiveTab(item.id) : item.onClick}
                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-300 relative ${
                  isActive 
                    ? 'text-neonBlue' 
                    : item.type === 'action'
                      ? item.id === 'scan' ? 'text-neonBlue/80 hover:text-neonBlue' : 'text-neonPurple/80 hover:text-neonPurple'
                      : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${
                  isActive ? 'scale-110 text-neonBlue neon-text-blue' : ''
                }`} />
                <span className="text-[9px] font-medium tracking-wider">{item.label}</span>
                
                {/* Glowing Dot Indicator under active tab */}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-neonBlue shadow-neon-blue absolute bottom-[-2px]"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
         2. DESKTOP SIDEBAR (UNTUK TABLET & LAPTOP)
         ======================================================== */}
      <aside className="hidden lg:flex w-64 p-6 h-screen sticky top-0 flex-col justify-between z-40">
        <div className="glass-panel border-white/5 h-full flex flex-col justify-between items-stretch p-6 gap-8">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 mb-2">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-neonPurple to-neonBlue shadow-neon-purple p-[1px]">
              <div className="w-full h-full bg-darkSpace-900 rounded-[10px] flex items-center justify-center">
                <Cpu className="w-4.5 h-4.5 text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-neonPurple" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-tr from-neonPurple to-neonBlue opacity-20 blur-xs animate-pulse-slow"></div>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-neonPurple font-mono">
                RAFTRACK
              </h1>
              <p className="text-[8px] tracking-widest text-cyanGlow font-mono font-semibold uppercase">
                GEMINI AI
              </p>
            </div>
          </div>

          {/* Menu Items list */}
          <nav className="flex flex-col gap-2.5 flex-grow justify-start">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium tracking-wide text-xs transition-all duration-300 relative overflow-hidden group ${
                    isActive
                      ? 'text-white bg-white/5 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'
                  } border border-transparent`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-neonBlue to-neonPurple shadow-neon-blue"></span>
                  )}
                  
                  <Icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? 'text-neonBlue neon-text-blue' : 'text-slate-400'
                  }`} />
                  
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Quick Actions Divider & Section */}
            <div className="border-t border-white/5 my-4 pt-4">
              <p className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase px-4 mb-3">
                Aksi Cepat
              </p>
              
              <div className="flex flex-col gap-2.5">
                {/* Scan Struk Button */}
                <button
                  onClick={() => {
                    setActiveTab('transactions');
                    setIsOCRModalOpen(true);
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium tracking-wide text-xs text-neonBlue border border-neonBlue/20 bg-neonBlue/5 hover:bg-neonBlue/10 transition-all duration-300 group cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-neonBlue group-hover:scale-110 transition-transform animate-pulse" />
                  <span>Scan Struk</span>
                </button>

                {/* Catat Manual Button */}
                <button
                  onClick={() => {
                    setActiveTab('transactions');
                    setEditingTransactionData(null);
                    setIsDrawerOpen(true);
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium tracking-wide text-xs text-neonPurple border border-neonPurple/20 bg-neonPurple/5 hover:bg-neonPurple/10 transition-all duration-300 group cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-neonPurple group-hover:scale-110 transition-transform" />
                  <span>Catat Manual</span>
                </button>
              </div>
            </div>
          </nav>

          {/* User profile & Logout */}
          <div className="flex flex-col items-stretch gap-4 border-t border-white/5 pt-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neonBlue to-neonPurple p-[1px] shadow-neon-blue flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-darkSpace-800 flex items-center justify-center font-bold text-xs text-white">
                    {user ? user.username.substring(0, 2).toUpperCase() : 'US'}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{user ? user.username : 'User'}</p>
                  <p className="text-[9px] text-slate-500 truncate">{user ? user.email : 'user@fintech.ai'}</p>
                </div>
              </div>
              
              {/* Theme Toggle Button Desktop */}
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-slate-200 transition-all ml-2"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-neonBlue" /> : <Moon className="w-3.5 h-3.5 text-neonPurple" />}
              </button>
            </div>

            <button
              onClick={logout}
              className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-neonRed border border-transparent hover:border-neonRed/20 hover:bg-neonRed/5 transition-all duration-300 group"
            >
              <LogOut className="w-3.5 h-3.5 text-neonRed group-hover:translate-x-0.5 transition-transform" />
              <span>Keluar Sistem</span>
            </button>
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;
