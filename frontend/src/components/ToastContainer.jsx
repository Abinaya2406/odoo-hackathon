import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer = React.memo(() => {
  const { toasts, removeToast } = useToast();
  const safeToasts = Array.isArray(toasts) ? toasts : [];

  if (safeToasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-200 bg-emerald-50/90 text-emerald-900',
    error: 'border-rose-200 bg-rose-50/90 text-rose-900',
    warning: 'border-amber-200 bg-amber-50/90 text-amber-900',
    info: 'border-blue-200 bg-blue-50/90 text-blue-900'
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {safeToasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-200 animate-in slide-in-from-bottom-5 ${
            borders[toast.type] || borders.info
          }`}
        >
          {icons[toast.type] || icons.info}
          <div className="flex-1 text-sm font-medium leading-snug">{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
});

ToastContainer.displayName = 'ToastContainer';
