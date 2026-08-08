"use client";

import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useToastStore, ToastType } from "@/store/useToastStore";

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="text-emerald-500" size={18} />,
  error: <XCircle className="text-red-500" size={18} />,
  info: <Info className="text-[#D4AF37]" size={18} />,
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3 max-w-sm w-full px-6 sm:px-0">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="flex items-start gap-3 p-4 bg-white border border-[#1A1A1A]/10 shadow-xl"
          >
            <div className="mt-0.5 shrink-0">{TOAST_ICONS[t.type]}</div>
            <p className="flex-1 text-[11px] font-bold tracking-widest uppercase text-[#1A1A1A] leading-relaxed">
              {t.message}
            </p>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
