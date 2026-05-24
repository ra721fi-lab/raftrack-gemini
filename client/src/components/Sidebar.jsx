import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, History, LogOut, Cpu, Compass } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout, user } = useContext(AuthContext);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard AI', icon: LayoutDashboard },
    { id: 'transactions', label: 'Riwayat Finansial', icon: History }
  ];

  return (
    <aside className="w-full lg:w-64 p-4 lg:p-6 lg:h-screen lg:sticky lg:top-0 flex flex-col justify-between z-40">
      {/* Container utama dengan efek glassmorphism melayang */}
      <div className="glass-panel border-white/5 h-full flex flex-row lg:flex-col justify-between items-center lg:items-stretch p-4 lg:p-6 w-full gap-4 lg:gap-8">
        
        {/* LOGO & BRANDING */}
        <div className="flex items-center gap-3 lg:mb-4">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-neonPurple to-neonBlue shadow-neon-purple p-[1px]">
            <div className="w-full h-full bg-darkSpace-900 rounded-[11px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-neonPurple" />
            </div>
            {/* Ambient pulse effect behind logo */}
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-tr from-neonPurple to-neonBlue opacity-30 blur-sm animate-pulse-slow"></div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-md font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-neonPurple font-mono">
              RAFTRACK
            </h1>
            <p className="text-[9px] tracking-widest text-cyanGlow font-mono font-semibold uppercase">
              GEMINI PRO v2
            </p>
          </div>
        </div>

        {/* MENU TABS */}
        <nav className="flex flex-row lg:flex-col gap-2 lg:gap-3 flex-grow lg:justify-start justify-center">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium tracking-wide text-sm transition-all duration-300 relative overflow-hidden group ${
                  isActive
                    ? 'text-white border-white/10 bg-white/5 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'
                } border`}
              >
                {/* Active Indicator Glow */}
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-neonBlue to-neonPurple shadow-neon-blue"></span>
                )}
                
                <Icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? 'text-neonBlue neon-text-blue' : 'text-slate-400'
                }`} />
                
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* PROFILE & LOGOUT SECTION */}
        <div className="flex lg:flex-col items-center lg:items-stretch gap-4 border-l lg:border-l-0 lg:border-t border-white/5 pl-4 lg:pl-0 lg:pt-4 w-auto lg:w-full">
          {/* User profile (Desktop only) */}
          <div className="hidden lg:flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-neonBlue to-neonPurple p-[1px] shadow-neon-blue flex-shrink-0">
              <div className="w-full h-full rounded-full bg-darkSpace-800 flex items-center justify-center font-bold text-xs text-white">
                {user ? user.username.substring(0, 2).toUpperCase() : 'US'}
              </div>
            </div>
            <div className="min-w-0 flex-grow">
              <p className="text-xs font-semibold text-slate-200 truncate">{user ? user.username : 'User'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user ? user.email : 'user@fintech.ai'}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center justify-center lg:justify-start gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-neonRed border border-transparent hover:border-neonRed/20 hover:bg-neonRed/10 transition-all duration-300 w-full group"
          >
            <LogOut className="w-4 h-4 text-neonRed group-hover:translate-x-0.5 transition-transform" />
            <span className="hidden lg:inline">Keluar Sistem</span>
          </button>
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;
