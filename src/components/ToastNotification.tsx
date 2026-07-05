import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, Loader2, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Global helper to trigger toasts anywhere in the app
export function showToast(message: string, type: ToastType = 'success', duration: number = 4000) {
  const event = new CustomEvent('ztr-toast', {
    detail: { message, type, duration }
  });
  window.dispatchEvent(event);
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: ToastType; duration?: number }>;
      const { message, type, duration = 4000 } = customEvent.detail;
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newToast: ToastItem = { id, message, type, duration };
      setToasts(prev => [...prev, newToast]);

      // If type is loading, we don't auto-dismiss immediately unless a short duration is specified
      if (type !== 'loading' || duration < 1000000) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    };

    window.addEventListener('ztr-toast', handleToastEvent);
    return () => {
      window.removeEventListener('ztr-toast', handleToastEvent);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          // Setup types styling matching Zanzibar Trip & Relax palette
          let bgColor = 'bg-white';
          let borderColor = 'border-slate-100';
          let textColor = 'text-slate-800';
          let iconColor = 'text-blue-600';
          let IconComponent: any = Info;
          let isSpinning = false;

          if (toast.type === 'success') {
            bgColor = 'bg-slate-900/95 backdrop-blur-md';
            borderColor = 'border-emerald-500/30';
            textColor = 'text-white';
            iconColor = 'text-emerald-400';
            IconComponent = CheckCircle2;
          } else if (toast.type === 'error') {
            bgColor = 'bg-red-950/95 backdrop-blur-md';
            borderColor = 'border-red-500/30';
            textColor = 'text-red-50';
            iconColor = 'text-red-400';
            IconComponent = AlertCircle;
          } else if (toast.type === 'warning') {
            bgColor = 'bg-amber-950/95 backdrop-blur-md';
            borderColor = 'border-amber-500/30';
            textColor = 'text-amber-50';
            iconColor = 'text-[#D4A017]';
            IconComponent = AlertTriangle;
          } else if (toast.type === 'loading') {
            bgColor = 'bg-[#0B3B8C]/95 backdrop-blur-md';
            borderColor = 'border-[#D4A017]/30';
            textColor = 'text-white';
            iconColor = 'text-[#D4A017]';
            IconComponent = Loader2;
            isSpinning = true;
          } else {
            // Info
            bgColor = 'bg-slate-950/95 backdrop-blur-md';
            borderColor = 'border-[#D4A017]/30';
            textColor = 'text-white';
            iconColor = 'text-[#D4A017]';
            IconComponent = Info;
          }

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl border ${borderColor} ${bgColor} ${textColor} shadow-lg shadow-black/10`}
            >
              <div className={`${iconColor} shrink-0 mt-0.5`}>
                <IconComponent size={18} className={isSpinning ? 'animate-spin' : ''} />
              </div>
              <div className="flex-1 text-xs font-semibold leading-relaxed">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-white transition-colors p-0.5 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
