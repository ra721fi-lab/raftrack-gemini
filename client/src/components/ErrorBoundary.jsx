import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[React ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 font-sans">
          <div className="glass-panel border-neonRed/30 p-6 sm:p-8 max-w-lg w-full flex flex-col items-center text-center relative overflow-hidden shadow-neon-red/10">
            <div className="w-14 h-14 rounded-2xl bg-neonRed/10 border border-neonRed/30 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-neonRed animate-pulse" />
            </div>

            <h3 className="text-lg font-bold font-mono tracking-wider text-slate-100">
              TERJADI KENDALA TAMPILAN
            </h3>
            
            <p className="text-xs text-slate-400 mt-2 font-mono leading-relaxed">
              Komponen interface mengalami gangguan saat memproses data. Anda dapat menyegarkan kembali komponen ini.
            </p>

            {this.state.error && (
              <div className="mt-4 p-3 bg-black/40 border border-white/5 rounded-xl w-full text-left">
                <p className="text-[10px] font-mono text-neonRed break-all">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-6 w-full">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono bg-gradient-to-r from-neonBlue to-neonPurple text-white hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Segarkan Halaman</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
