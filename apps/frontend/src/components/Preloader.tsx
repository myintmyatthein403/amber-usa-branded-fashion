"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

export default function Preloader() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem("amber-preloader-done");
    
    if (!hasLoaded) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem("amber-preloader-done", "true");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
          className="fixed inset-0 z-[999] bg-[#1A1A1A] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Amber Pattern Background */}
          <div className="absolute inset-0 acheik-pattern opacity-10" />

          <div className="relative flex flex-col items-center space-y-8">
            {/* Logo Animation */}
            <div className="flex flex-col items-center overflow-hidden">
              <motion.h1
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-6xl md:text-8xl font-serif tracking-tighter uppercase text-white leading-none"
              >
                Amber
              </motion.h1>
              <motion.span
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-[#D4AF37] mt-2 font-bold"
              >
                Premium USA Brands
              </motion.span>
            </div>

            {/* Progress Bar */}
            <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute inset-0 bg-[#D4AF37]"
              />
            </div>

            {/* Authenticity Message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-[8px] uppercase tracking-[0.3em] text-white/30 font-bold"
            >
              Curating Modern Myanmar Heritage
            </motion.p>
          </div>

          {/* Decorative Circles */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.05 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white rounded-full pointer-events-none"
          />
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0.03 }}
            transition={{ delay: 0.2, duration: 1.5, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white rounded-full pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
