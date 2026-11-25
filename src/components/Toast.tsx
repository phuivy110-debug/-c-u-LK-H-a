import React from 'react';
import { CheckCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  if (!message) return null;
  return (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 animate-[toast-in_180ms_ease-out]"
        >
          {type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-orange-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{message}</span>
          <button
            onClick={onClose}
            className="ml-2 text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded hover:bg-slate-800"
          >
            ✕
          </button>
        </div>
  );
};
