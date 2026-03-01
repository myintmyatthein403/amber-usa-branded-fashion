"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { motion } from "motion/react";
import { Mail, ArrowRight, Sparkles } from "lucide-react";

export default function ComingSoonPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 45,
    hours: 12,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 acheik-pattern opacity-5" />
      <motion.div 
        animate={{ 
          opacity: [0.05, 0.1, 0.05],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute top-1/4 -right-20 w-96 h-96 bg-[#D4AF37] rounded-full blur-[120px] pointer-events-none"
      />

      <div className="relative z-10 text-center max-w-4xl px-6 py-24 space-y-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="flex justify-center">
            <div className="bg-[#F5F0E1] p-4 rounded-full">
              <Sparkles className="w-8 h-8 text-[#D4AF37]" />
            </div>
          </div>
          <span className="text-[#D4AF37] text-[10px] uppercase font-bold tracking-[0.5em] block">Summer 2026 Collection</span>
          <h1 className="text-5xl md:text-8xl font-serif text-[#1A1A1A] leading-tight">
            Something <br /> <span className="italic">Exquisite</span> is Coming
          </h1>
          <p className="text-[#1A1A1A]/40 text-lg max-w-xl mx-auto leading-relaxed">
            We are curating a new selection of authentic USA luxury pieces. 
            Be the first to experience the unveiling.
          </p>
        </motion.div>

        {/* Countdown */}
        <div className="flex justify-center space-x-8 md:space-x-16">
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hours", value: timeLeft.hours },
            { label: "Minutes", value: timeLeft.minutes },
            { label: "Seconds", value: timeLeft.seconds },
          ].map((unit, i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <span className="text-4xl md:text-6xl font-serif text-[#1A1A1A]">{String(unit.value).padStart(2, '0')}</span>
              <span className="text-[8px] uppercase font-bold tracking-widest text-[#D4AF37]">{unit.label}</span>
            </div>
          ))}
        </div>

        {/* Waitlist */}
        <div className="max-w-md mx-auto space-y-6">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60">Join the Exclusive Waitlist</p>
          <div className="flex space-x-2">
            <input 
              type="email" 
              placeholder="Email Address" 
              className="flex-1 p-5 bg-white border border-[#1A1A1A]/5 shadow-xl outline-none focus:border-[#D4AF37] transition-all text-sm"
            />
            <button className="bg-[#1A1A1A] text-white px-8 py-5 uppercase tracking-widest text-[10px] font-bold hover:bg-[#D4AF37] transition-all flex items-center space-x-3 group">
              <span>Notify Me</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-12 left-0 right-0 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#1A1A1A]/20 font-bold">
          Amber Premium • Premium USA Authentic Brands
        </p>
      </footer>
    </main>
  );
}
