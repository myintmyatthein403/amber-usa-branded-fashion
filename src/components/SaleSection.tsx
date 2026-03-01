"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { ShoppingBag, Timer, ArrowRight, Percent } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function SaleSection() {
  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 5,
    minutes: 42,
    seconds: 30
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
    <section className="py-24 px-6 md:px-12 bg-[#1A1A1A] relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 acheik-pattern opacity-10" />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37] rounded-full blur-[150px] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left: Sale Info */}
          <div className="flex-1 space-y-10 text-center lg:text-left">
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start space-x-3 text-[#D4AF37]">
                <Percent className="w-6 h-6" />
                <span className="text-[10px] uppercase font-bold tracking-[0.5em]">Limited Time Event</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-serif text-white leading-tight">
                Thingyan <br /> 
                <span className="italic text-[#D4AF37]">Mega Sale</span>
              </h2>
              <p className="text-white/40 text-lg font-sans max-w-lg mx-auto lg:mx-0">
                Celebrate the Myanmar New Year with authentic USA brands at unprecedented prices. 
                Genuine Coach, Nike, and Adidas items — 100% Authentic.
              </p>
            </div>

            {/* Countdown */}
            <div className="flex justify-center lg:justify-start space-x-6 md:space-x-10">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hrs", value: timeLeft.hours },
                { label: "Min", value: timeLeft.minutes },
                { label: "Sec", value: timeLeft.seconds },
              ].map((unit, i) => (
                <div key={i} className="flex flex-col items-center space-y-2">
                  <div className="text-3xl md:text-5xl font-serif text-white">{String(unit.value).padStart(2, '0')}</div>
                  <span className="text-[8px] uppercase font-bold tracking-widest text-[#D4AF37]">{unit.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <Link 
                href="/shop?sale=true"
                className="bg-[#D4AF37] text-[#1A1A1A] px-12 py-6 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-white transition-all shadow-2xl flex items-center justify-center space-x-4 group"
              >
                <span>Shop the Sale</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
              </Link>
              <button className="border border-white/10 text-white px-12 py-6 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-white/5 transition-all">
                View Collection
              </button>
            </div>
          </div>

          {/* Right: Featured Sale Items Visual */}
          <div className="flex-1 relative w-full h-[500px] md:h-[600px] flex items-center justify-center">
            <motion.div 
              initial={{ rotate: 10, scale: 0.9 }}
              whileInView={{ rotate: -5, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative w-[300px] h-[400px] md:w-[350px] md:h-[500px] bg-[#F5F0E1] shadow-2xl overflow-hidden rounded-sm border-[12px] border-white z-10"
            >
              <Image 
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800" 
                alt="Nike Sale Item" 
                fill 
                className="object-cover"
              />
              <div className="absolute top-4 right-4 bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg">
                -35%
              </div>
            </motion.div>

            {/* Background Image Layer */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 0.5 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="absolute top-10 right-0 w-[250px] h-[350px] overflow-hidden rounded-sm brightness-50 z-0"
            >
              <Image 
                src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800" 
                alt="Coach Sale Item" 
                fill 
                className="object-cover"
              />
            </motion.div>

            {/* Floating Sale Tag */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 bg-white p-8 shadow-2xl z-20 hidden md:block"
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-serif text-[#D4AF37]">40%</div>
                <div className="text-[8px] uppercase font-bold tracking-widest leading-none text-[#1A1A1A]">
                  Maximum <br /> Discount
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
