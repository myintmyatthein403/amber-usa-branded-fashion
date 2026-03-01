"use client";

import { motion } from "motion/react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#FDFDFD] py-20 md:py-0">
      {/* Background Texture/Acheik Pattern */}
      <div className="absolute inset-0 acheik-pattern" />

      {/* Decorative Gold Elements */}
      <motion.div 
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 0.05, x: 0 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-1/4 -left-20 w-96 h-96 border-[40px] border-[#D4AF37] rounded-full blur-3xl pointer-events-none"
      />
      <motion.div 
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 0.05, x: 0 }}
        transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
        className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#D4AF37] rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 md:pt-0 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-12 items-center">
        {/* Left: Content */}
        <div className="flex flex-col space-y-8 mt-10 md:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[#D4AF37] font-sans font-semibold tracking-[0.3em] uppercase text-[10px]">
              Authentic USA Brands • Myanmar
            </span>
            <h1 className="mt-4 text-5xl md:text-8xl font-serif text-[#1A1A1A] leading-[1.1] md:leading-[0.9]">
              Global <br />
              <span className="italic text-[#D4AF37]">Authenticity</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[#1A1A1A]/70 max-w-md text-lg leading-relaxed font-sans"
          >
            Bringing your favorite premium USA brands directly to Myanmar. 
            100% Guaranteed Authentic clothing and accessories at the fairest prices.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button className="bg-[#1A1A1A] text-white px-8 py-4 uppercase tracking-widest text-xs font-semibold hover:bg-[#D4AF37] transition-all duration-300 transform hover:-translate-y-1">
              Shop Brands
            </button>
            <button className="border border-[#1A1A1A]/20 text-[#1A1A1A] px-8 py-4 uppercase tracking-widest text-xs font-semibold hover:border-[#D4AF37] transition-all duration-300 transform hover:-translate-y-1">
              Check Legitimacy
            </button>
          </motion.div>
        </div>

        {/* Right: Image Gallery/Composition */}
        <div className="relative h-[500px] md:h-[600px] flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative w-[280px] md:w-[350px] h-[400px] md:h-[500px] shadow-2xl overflow-hidden rounded-sm"
          >
            <Image 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800" 
              alt="Amber Fashion Model"
              fill
              className="object-cover"
              priority
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="absolute -bottom-5 md:-bottom-10 -left-5 md:-left-10 w-[150px] md:[200px] h-[200px] md:h-[250px] shadow-xl overflow-hidden rounded-sm border-4 md:border-8 border-white z-20"
          >
            <Image 
              src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800" 
              alt="Fabric Detail"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <span className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 mb-2">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-[#1A1A1A]/40 to-transparent" />
      </motion.div>
    </section>
  );
}
