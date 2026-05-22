import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore, ToastType } from '../../store/useToastStore';

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="text-emerald-500" size={18} />,
  error: <XCircle className="text-rose-500" size={18} />,
  warning: <AlertCircle className="text-amber-500" size={18} />,
  info: <Info className="text-blue-500" size={18} />,
};

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'border-emerald-500/20 bg-emerald-500/5',
  error: 'border-rose-500/20 bg-rose-500/5',
  warning: 'border-amber-500/20 bg-amber-500/5',
  info: 'border-blue-500/20 bg-blue-500/5',
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 max-w-md w-full sm:w-auto">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={`
              flex items-start gap-3 p-4 rounded-none border shadow-lg backdrop-blur-md
              ${TOAST_STYLES[toast.type]}
            `}
          >
            <div className="mt-0.5">{TOAST_ICONS[toast.type]}</div>
            
            <div className="flex-1">
              <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-foreground leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
