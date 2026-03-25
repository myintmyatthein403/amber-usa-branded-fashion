"use client";

import Link from "next/link";
import { motion } from "motion/react";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Decorative Element */}
      <div className="absolute inset-0 acheik-pattern opacity-5 pointer-events-none" />
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#D4AF37]/10 rounded-full pointer-events-none"
      />

      <div className="relative z-10 text-center space-y-8 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-[#F5F0E1] rounded-full flex items-center justify-center mb-4">
              <Compass className="w-10 h-10 text-[#D4AF37]" />
            </div>
          </div>
          <h1 className="text-8xl md:text-[12rem] font-serif text-[#1A1A1A] leading-none opacity-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 select-none">
            404
          </h1>
          <h2 className="text-4xl md:text-6xl font-serif text-[#1A1A1A]">Page Not Found</h2>
          <p className="text-[#1A1A1A]/40 uppercase tracking-[0.3em] text-[10px] font-bold max-w-sm mx-auto leading-relaxed">
            The collection you are looking for has either moved or doesn&apos;t exist in our current season.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-8"
        >
          <Link 
            href="/"
            className="inline-flex items-center space-x-4 bg-[#1A1A1A] text-white px-12 py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#D4AF37] transition-all shadow-xl group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-2" />
            <span>Return to Home</span>
          </Link>
        </motion.div>
      </div>

      <footer className="absolute bottom-12 left-0 right-0 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#1A1A1A]/20 font-bold">
          © 2026 Amber Premium • Authentic USA Brands
        </p>
      </footer>
    </main>
  );
}
