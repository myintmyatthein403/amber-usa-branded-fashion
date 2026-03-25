import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]'
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-x-hidden overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Modal Container */}
          <motion.div
            className={`relative w-full ${sizeClasses[size]} bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh] rounded-none border border-border`}
            initial={{ y: 10, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 10, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-10 py-8 border-b border-border bg-card sticky top-0 z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3 bg-primary" />
                  <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase block">Management Portal</span>
                </div>
                <h3 className="text-3xl font-serif text-foreground tracking-tight">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="group p-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
                aria-label="Close modal"
              >
                <X size={24} className="transform group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>

            {/* Content */}
            <div className="px-10 py-10 overflow-y-auto custom-scrollbar bg-background">
              {children}
            </div>
            
            {/* Gold Accent Line */}
            <div className="h-[2px] w-full bg-primary" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
