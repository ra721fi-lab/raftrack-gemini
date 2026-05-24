import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        // Skema warna & ikon berdasarkan jenis toast
        let typeStyles = 'border-cyanGlow bg-darkSpace-800/90 shadow-neon-cyan';
        let icon = <CheckCircle2 className="w-5 h-5 text-cyanGlow" />;

        if (toast.type === 'error') {
          typeStyles = 'border-neonRed bg-darkSpace-800/90 shadow-neon-red';
          icon = <AlertCircle className="w-5 h-5 text-neonRed" />;
        } else if (toast.type === 'info') {
          typeStyles = 'border-neonBlue bg-darkSpace-800/90 shadow-neon-blue';
          icon = <Info className="w-5 h-5 text-neonBlue" />;
        } else if (toast.type === 'warning') {
          typeStyles = 'border-amber-500 bg-darkSpace-800/90 shadow-amber-500/30';
          icon = <AlertCircle className="w-5 h-5 text-amber-500" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center p-4 border rounded-xl backdrop-blur-md transition-all duration-500 transform translate-y-0 opacity-100 ${typeStyles}`}
            style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)' }}
          >
            <div className="flex-shrink-0 mr-3">{icon}</div>
            <div className="flex-grow text-sm font-medium tracking-wide text-slate-100">
              {toast.message}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
