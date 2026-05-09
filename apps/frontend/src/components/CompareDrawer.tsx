"use client";

import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { X, Scale, ArrowRight } from "lucide-react";
import { useStore } from "@/store/useStore";
import CompareModal from "./modals/CompareModal";
import { useState, useEffect } from "react";
import Price from "./Price";

export default function CompareDrawer() {
  const [mounted, setMounted] = useState(typeof window !== 'undefined');

  const compareList = useStore((state) => state.compareList);
  const isCompareDrawerOpen = useStore((state) => state.isCompareDrawerOpen);
  const setCompareDrawerOpen = useStore((state) => state.setCompareDrawerOpen);
  const isCompareModalOpen = useStore((state) => state.isCompareModalOpen);
  const setCompareModalOpen = useStore((state) => state.setCompareModalOpen);
  const removeFromCompare = useStore((state) => state.removeFromCompare);
  const clearCompare = useStore((state) => state.clearCompare);

  if (!mounted || compareList.length === 0) return null;

  return (
    <>
      <CompareModal 
        products={compareList as any}
        isOpen={isCompareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        onRemove={removeFromCompare}
      />

      <AnimatePresence>
        {isCompareDrawerOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed bottom-0 left-0 right-0 z-[90] bg-white border-t border-[#1A1A1A]/10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 md:p-8"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <Scale className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]">
                    Comparing {compareList.length} Products
                  </h3>
                </div>
                <div className="flex items-center space-x-6">
                  <button 
                    onClick={clearCompare}
                    className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                  >
                    Clear All
                  </button>
                  <button 
                    onClick={() => setCompareDrawerOpen(false)}
                    className="p-2 text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 items-end">
                {compareList.map((product) => (
                  <div key={product.id} className="relative group flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 p-4 border border-[#1A1A1A]/5 bg-[#F5F0E1]/30">
                    <div className="relative w-16 h-20 shrink-0 bg-white shadow-sm overflow-hidden">
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] line-clamp-1">{product.name}</h4>
                      <Price amount={product.price} isUsdPrice={product.isUsdPrice} className="text-[10px] text-[#D4AF37] font-bold" />
                      <p className="text-[9px] text-[#1A1A1A]/40 uppercase tracking-widest">{(product as any).category?.name}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCompare(product.id as any)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {compareList.length > 1 && (
                  <div className="col-span-full pt-6 border-t border-[#1A1A1A]/5 flex justify-center">
                    <button 
                      onClick={() => setCompareModalOpen(true)}
                      className="bg-[#1A1A1A] text-white px-12 py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#D4AF37] transition-all flex items-center space-x-4 group shadow-xl"
                    >
                      <span>Show Side-by-Side Comparison</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
        
        {!isCompareDrawerOpen && compareList.length > 0 && (
          <motion.button
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            onClick={() => setCompareDrawerOpen(true)}
            className="fixed bottom-8 right-8 z-[80] bg-[#1A1A1A] text-white p-5 rounded-full shadow-2xl flex items-center space-x-3 hover:bg-[#D4AF37] transition-all group"
          >
            <Scale className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="text-[10px] font-bold uppercase tracking-widest pr-2">Compare ({compareList.length})</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
