"use client";

import Navbar from "@/components/Navbar";
import { motion } from "motion/react";
import { Hammer, ArrowLeft, Instagram } from "lucide-react";
import Link from "next/link";

export default function UnderConstructionPage() {
  return (
    <main className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 acheik-pattern opacity-5" />
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-[0.02] pointer-events-none">
        <Hammer className="w-[500px] h-[500px] -rotate-12" />
      </div>

      <div className="relative z-10 text-center space-y-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-[#F5F0E1] rounded-full flex items-center justify-center border-2 border-[#D4AF37]/20">
              <Hammer className="w-8 h-8 text-[#D4AF37]" />
            </div>
          </div>
          <span className="text-[#D4AF37] text-[10px] uppercase font-bold tracking-[0.5em] block">Enhancing Your Experience</span>
          <h1 className="text-5xl md:text-7xl font-serif text-[#1A1A1A]">Under <br /> Construction</h1>
          <p className="text-[#1A1A1A]/40 text-lg max-w-lg mx-auto leading-relaxed">
            We are currently updating our online shop to better serve you with the latest authentic USA brands. 
            We&apos;ll be back online very shortly.
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
          <Link 
            href="/"
            className="inline-flex items-center space-x-4 bg-[#1A1A1A] text-white px-12 py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#D4AF37] transition-all shadow-xl group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-2" />
            <span>Go Back</span>
          </Link>
          <a 
            href="https://www.facebook.com/amberbrandfashion"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-4 border border-[#1A1A1A]/10 px-12 py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#F5F0E1]/50 transition-all"
          >
            <Instagram className="w-4 h-4" />
            <span>Follow Updates</span>
          </a>
        </div>

        <div className="pt-12">
          <div className="inline-flex items-center space-x-4 text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/20">
            <div className="w-12 h-px bg-[#1A1A1A]/10" />
            <span>Estimated Uptime: 2 Hours</span>
            <div className="w-12 h-px bg-[#1A1A1A]/10" />
          </div>
        </div>
      </div>

      <footer className="absolute bottom-12 text-center w-full">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#1A1A1A]/20 font-bold">
          Amber Premium • Authentic USA Brands • Myanmar
        </p>
      </footer>
    </main>
  );
}
