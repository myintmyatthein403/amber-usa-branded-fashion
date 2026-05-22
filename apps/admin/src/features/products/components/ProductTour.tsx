import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  description: string;
}

const tourSteps: TourStep[] = [
  {
    target: 'search',
    title: 'Catalog Search',
    description: 'Search your products by name or slug. Results update automatically as you type.',
  },
  {
    target: 'view-modes',
    title: 'View Modes',
    description: 'Switch between grid and list views to browse your catalog in your preferred layout.',
  },
  {
    target: 'filters',
    title: 'Product Filters',
    description: 'Filter products by status, category, brand, and flags like Sale, Featured, New Arrival, or Best Seller.',
  },
  {
    target: 'init-button',
    title: 'Initialize Product',
    description: 'Click here to create a new product. You can add variants, pricing, and media in the product form.',
  },
  {
    target: 'product-row',
    title: 'Product Card',
    description: 'Each card shows product preview, category, price, and status. Hover to reveal edit and delete actions.',
  },
];

interface ProductTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductTour: React.FC<ProductTourProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (isOpen && currentStep >= 0 && currentStep < tourSteps.length) {
      const target = tourSteps[currentStep].target;
      const element = document.querySelector(`[data-tour="${target}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      }
    }
  }, [isOpen, currentStep]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
      setCurrentStep(0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    onClose();
    setCurrentStep(0);
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
      >
        <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
        
        {targetRect && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute pointer-events-none"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
              }}
            >
              <div className="absolute inset-0 border-2 border-primary rounded-lg shadow-[0_0_20px_rgba(212,163,115,0.5)] ring-2 ring-primary/30" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bg-[#111] border border-white/20 p-8 shadow-2xl max-w-sm w-full z-[60]"
              style={{
                top: targetRect.bottom + 24,
                left: Math.min(Math.max(16, targetRect.left + (targetRect.width / 2) - 192), window.innerWidth - 400),
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                    Step {currentStep + 1} of {tourSteps.length}
                  </span>
                  <h3 className="text-2xl font-serif text-white mt-2">{step.title}</h3>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 text-white/40 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-white/60 leading-relaxed mb-8">{step.description}</p>

              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white disabled:opacity-10 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-4 bg-white text-black pl-6 pr-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-300"
                >
                  {currentStep === tourSteps.length - 1 ? 'Finish' : (
                    <>
                      Next <ChevronRight size={14} strokeWidth={3} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};