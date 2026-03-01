"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Ruler } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  const sizeData = [
    { size: "XS", bust: "31-32", waist: "24-25", hips: "34-35" },
    { size: "S", bust: "33-34", waist: "26-27", hips: "36-37" },
    { size: "M", bust: "35-36", waist: "28-29", hips: "38-39" },
    { size: "L", bust: "37-38", waist: "30-31", hips: "40-41" },
    { size: "XL", bust: "39-40", waist: "32-33", hips: "42-43" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white p-8 md:p-12 shadow-2xl rounded-sm overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4 mb-10">
              <div className="w-12 h-12 bg-[#F5F0E1] rounded-full flex items-center justify-center">
                <Ruler className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h2 className="text-3xl font-serif text-[#1A1A1A]">Size Guide</h2>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D4AF37]">Find Your Perfect Fit</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1A1A1A]/10">
                    <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Size</th>
                    <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Bust (in)</th>
                    <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Waist (in)</th>
                    <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Hips (in)</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-sans text-[#1A1A1A]/60">
                  {sizeData.map((row) => (
                    <tr key={row.size} className="border-b border-[#1A1A1A]/5 hover:bg-[#F5F0E1]/30 transition-colors">
                      <td className="py-4 font-bold text-[#1A1A1A]">{row.size}</td>
                      <td className="py-4">{row.bust}</td>
                      <td className="py-4">{row.waist}</td>
                      <td className="py-4">{row.hips}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-10 p-6 bg-[#F5F0E1]/50 space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">How to Measure</h4>
              <p className="text-xs text-[#1A1A1A]/60 leading-relaxed italic">
                Measure around the fullest part of your bust, the narrowest part of your waist, and the widest part of your hips. For Amber Heritage Longyis, we recommend choosing your standard waist size for the best drape.
              </p>
            </div>

            <button
              onClick={onClose}
              className="mt-10 w-full border border-[#1A1A1A] py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-white transition-all"
            >
              Close Guide
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
