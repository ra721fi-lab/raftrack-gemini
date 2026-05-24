import React, { useContext } from 'react';
import { TransactionContext } from '../context/TransactionContext';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Wallet, ArrowDownLeft, ArrowUpRight, Cpu, 
  Sparkles, TrendingUp, AlertTriangle, Lightbulb, FileText, Printer, ArrowRight
} from 'lucide-react';

// Format mata uang Rupiah
const formatIDR = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

const Dashboard = ({ setActiveTab }) => {
  const { stats, transactions, statsLoading, downloadCSV } = useContext(TransactionContext);

  // Loading indicator untuk stats
  if (statsLoading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-t-neonBlue border-r-neonBlue/30 rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-mono text-slate-400 tracking-wider">MENGAGREGASI METRIK FINANSIAL AI...</p>
      </div>
    );
  }

  // Persiapan data Chart Tren
  const chartData = stats.monthlyTrend && stats.monthlyTrend.length > 0
    ? stats.monthlyTrend
    : [
        { name: 'Bulan 1', pemasukan: 0, pengeluaran: 0 },
      ];

  // Persiapan data Chart Kategori
  const pieData = stats.categoryBreakdown && stats.categoryBreakdown.length > 0
    ? stats.categoryBreakdown
    : [
        { name: 'Belum Ada Pengeluaran', value: 1, color: '#a0aec0' }
      ];

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* 1. KARTU METRIK SALDO, PEMASUKAN, PENGELUARAN (NEON GLASSMETRICS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* TOTAL SALDO */}
        <div className="glass-panel border-neonBlue/20 p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neonBlue/5 rounded-full filter blur-lg transition-all group-hover:bg-neonBlue/10"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono">SALDO REAL-TIME</span>
            <div className="w-8 h-8 rounded-lg bg-neonBlue/15 border border-neonBlue/30 flex items-center justify-center shadow-neon-blue">
              <Wallet className="w-4 h-4 text-neonBlue" />
            </div>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-white font-mono leading-none">
            {formatIDR(stats.balance)}
          </h3>
          <p className="text-[10px] text-cyanGlow font-mono mt-2 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyanGlow animate-pulse"></span>
            AKTIF & TERINTEGRASI
          </p>
        </div>

        {/* TOTAL PEMASUKAN */}
        <div className="glass-panel border-cyanGlow/20 p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyanGlow/5 rounded-full filter blur-lg transition-all group-hover:bg-cyanGlow/10"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono">TOTAL PEMASUKAN</span>
            <div className="w-8 h-8 rounded-lg bg-cyanGlow/15 border border-cyanGlow/30 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 text-cyanGlow" />
            </div>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-200 font-mono leading-none">
            {formatIDR(stats.totalIncome)}
          </h3>
          <p className="text-[10px] text-slate-500 font-mono mt-2 uppercase">
            Periode Berjalan
          </p>
        </div>

        {/* TOTAL PENGELUARAN */}
        <div className="glass-panel border-neonRed/20 p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neonRed/5 rounded-full filter blur-lg transition-all group-hover:bg-neonRed/10"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono">TOTAL PENGELUARAN</span>
            <div className="w-8 h-8 rounded-lg bg-neonRed/15 border border-neonRed/30 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-neonRed" />
            </div>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-200 font-mono leading-none">
            {formatIDR(stats.totalExpense)}
          </h3>
          <p className="text-[10px] text-slate-500 font-mono mt-2 uppercase">
            Akumulasi Pengeluaran
          </p>
        </div>

      </div>

      {/* 2. AREA GRAFIK TREN FINANSIAL & PIE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART 1: AREA CHART BULANAN (2/3 LEBAR) */}
        <div className="glass-panel p-5 border-white/5 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neonBlue" />
              <h4 className="text-xs font-bold font-mono tracking-widest text-slate-300 uppercase">Tren Arus Kas Bulanan</h4>
            </div>
            <span className="text-[9px] font-mono text-slate-500 px-2 py-0.5 rounded bg-white/5 uppercase">
              Real-time update
            </span>
          </div>

          <div className="w-full h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#00f2fe" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff007f" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#ff007f" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(8, 8, 22, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}
                  labelStyle={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}
                  itemStyle={{ fontSize: '11px', color: '#fff' }}
                  formatter={(value) => formatIDR(value)}
                />
                <Area type="monotone" name="Pemasukan" dataKey="pemasukan" stroke="#00f2fe" strokeWidth={2} fillOpacity={1} fill="url(#colorPemasukan)" />
                <Area type="monotone" name="Pengeluaran" dataKey="pengeluaran" stroke="#ff007f" strokeWidth={2} fillOpacity={1} fill="url(#colorPengeluaran)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: PIE CHART KATEGORI (1/3 LEBAR) */}
        <div className="glass-panel p-5 border-white/5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-neonPurple" />
            <h4 className="text-xs font-bold font-mono tracking-widest text-slate-300 uppercase">Alokasi Kategori AI</h4>
          </div>

          <div className="w-full h-48 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#a0aec0'} stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(8, 8, 22, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}
                  itemStyle={{ fontSize: '10px', color: '#fff' }}
                  formatter={(value) => formatIDR(value)}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Summary Text inside Pie Chart */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Akumulasi</span>
              <span className="text-sm font-bold text-white font-mono">{formatIDR(stats.totalExpense)}</span>
            </div>
          </div>

          {/* Kategori Legenda */}
          <div className="flex flex-wrap gap-2 justify-center mt-3 max-h-20 overflow-y-auto pr-1">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || '#a0aec0' }}></span>
                <span className="capitalize">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. DUA COLUMN BAWAH: AI INSIGHTS & TRANSAKSI TERBARU */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* KIRI: AI INSIGHT & REKOMENDASI (2/5 LEBAR) */}
        <div className="glass-panel p-5 border-white/5 lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Sparkles className="w-4 h-4 text-cyanGlow neon-text-cyan animate-pulse" />
            <h4 className="text-xs font-bold font-mono tracking-widest text-slate-300 uppercase">AI Finance Advisory</h4>
          </div>

          {/* AI ALERTS (NOTIFIKASI PENGELUARAN) */}
          <div className="flex flex-col gap-3">
            {stats.insights && stats.insights.map((insight, idx) => {
              const isWarning = insight.type === 'WARNING';
              const isSuccess = insight.type === 'SUCCESS';
              
              return (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border text-xs leading-relaxed flex gap-2.5 bg-black/20 ${
                    isWarning 
                      ? 'border-neonRed/20 text-neonRed' 
                      : isSuccess 
                        ? 'border-cyanGlow/20 text-cyanGlow' 
                        : 'border-white/5 text-slate-300'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p dangerouslySetInnerHTML={{ __html: insight.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
                </div>
              );
            })}
          </div>

          {/* DYNAMIC TIPS CAROUSEL */}
          <div className="flex flex-col gap-2.5 mt-2 bg-white/5 p-4 rounded-xl border border-white/5">
            <h5 className="text-[10px] font-bold font-mono text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-cyanGlow" />
              Saran Penghematan AI
            </h5>
            <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1.5 mt-1 leading-relaxed">
              {stats.savingTips && stats.savingTips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>

          {/* PREDICTION METRIC */}
          {stats.predictions && stats.predictions.predictedExpense > 0 && (
            <div className="mt-2 p-3 rounded-xl border border-neonPurple/20 bg-neonPurple/5 flex items-center justify-between text-xs font-mono">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Prediksi Pengeluaran Depan</p>
                <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-neonPurple to-neonBlue mt-0.5">
                  {formatIDR(stats.predictions.predictedExpense)}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                stats.predictions.confidence === 'HIGH' ? 'bg-cyanGlow/10 text-cyanGlow' : 'bg-amber-500/10 text-amber-500'
              }`}>
                CONFIDENCE: {stats.predictions.confidence}
              </span>
            </div>
          )}

        </div>

        {/* KANAN: TRANSAKSI TERBARU & QUICK ACTIONS (3/5 LEBAR) */}
        <div className="glass-panel p-5 border-white/5 lg:col-span-3 flex flex-col justify-between gap-4">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h4 className="text-xs font-bold font-mono tracking-widest text-slate-300 uppercase">Riwayat Aktivitas Terbaru</h4>
            
            {/* Quick action buttons */}
            <div className="flex gap-2">
              <button 
                onClick={downloadCSV}
                title="Ekspor CSV"
                className="p-1.5 rounded-lg border border-white/5 bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => window.print()}
                title="Cetak Laporan"
                className="p-1.5 rounded-lg border border-white/5 bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* TRANSAKSI LIST */}
          <div className="flex-grow overflow-x-auto">
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <p className="text-xs font-mono uppercase tracking-widest">Belum ada transaksi tercatat</p>
                <button 
                  onClick={() => setActiveTab('transactions')}
                  className="mt-3 text-xs font-bold text-neonBlue flex items-center gap-1 hover:underline"
                >
                  Catat transaksi pertama Anda &rarr;
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {recentTransactions.map((tx) => {
                  const isIncome = tx.type === 'pemasukan';
                  return (
                    <div 
                      key={tx.id} 
                      className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-black/10 hover:bg-white/5 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Category Color Dot */}
                        <div 
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tx.category_color, boxShadow: `0 0 8px ${tx.category_color}` }}
                        ></div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-200 truncate">{tx.description || 'Transaksi Tanpa Nama'}</p>
                          <p className="text-[9px] font-mono text-slate-500 mt-0.5 capitalize">
                            {tx.category_name} &bull; {tx.date}
                          </p>
                        </div>
                      </div>
                      
                      <span className={`text-xs font-bold font-mono ${
                        isIncome ? 'text-cyanGlow neon-text-cyan' : 'text-neonRed neon-text-red'
                      }`}>
                        {isIncome ? '+' : '-'} {formatIDR(tx.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* NAVIGATE TO ALL TRANSACTIONS BUTTON */}
          {recentTransactions.length > 0 && (
            <button 
              onClick={() => setActiveTab('transactions')}
              className="mt-2 py-2.5 border border-white/5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 group"
            >
              <span>Buka Semua Log Transaksi</span>
              <ArrowRight className="w-3.5 h-3.5 text-neonBlue group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
