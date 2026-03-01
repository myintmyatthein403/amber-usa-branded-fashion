"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { ShieldCheck, Globe, DollarSign } from "lucide-react";

export default function AuthenticStory() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <section ref={containerRef} className="py-32 px-6 md:px-12 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          
          {/* Left: Multi-layered Images */}
          <div className="relative h-[700px] flex items-center justify-center">
            <motion.div style={{ y: y1 }} className="absolute top-0 right-0 w-[300px] h-[450px] shadow-2xl z-10 border-[12px] border-white">
              <Image 
                src="https://images.unsplash.com/photo-1555529669-e69e7aa0bd9a?q=80&w=800&auto=format&fit=crop" 
                alt="USA Fashion Store" 
                fill 
                className="object-cover" 
              />
            </motion.div>
            
            <motion.div style={{ y: y2 }} className="absolute bottom-0 left-0 w-[350px] h-[500px] shadow-2xl z-0 overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop" 
                alt="Premium Clothing Rack" 
                fill 
                className="object-cover brightness-75" 
              />
            </motion.div>

            {/* Floating Trust Badge */}
            <div className="absolute -bottom-10 right-10 bg-[#D4AF37] p-10 text-white shadow-2xl z-20 max-w-[220px]">
              <ShieldCheck className="w-10 h-10 mb-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                Directly Imported from Official USA Stores. 100% Legit.
              </p>
            </div>
          </div>

          {/* Right: Story Content */}
          <div className="space-y-12">
            <div className="space-y-6">
              <span className="text-[#D4AF37] text-[10px] uppercase font-bold tracking-[0.5em] block">Our Mission</span>
              <h2 className="text-5xl md:text-7xl font-serif text-[#1A1A1A] leading-[1.1]">
                Real Brands. <br /> <span className="italic text-[#D4AF37]">Fair Price.</span>
              </h2>
            </div>

            <div className="space-y-8 text-[#1A1A1A]/70 text-lg leading-relaxed font-sans max-w-lg">
              <p>
                Amber Premium was born from a simple need: access to genuine international brands in Myanmar without the sky-high markups.
              </p>
              <p className="text-base">
                We bridge the gap between global fashion and our local community. Every item in our shop is sourced directly from brand outlets and authorized retailers in the USA, ensuring you get exactly what you pay for.
              </p>
            </div>

            <div className="pt-8 border-t border-[#1A1A1A]/5 grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div className="flex items-start space-x-4">
                <Globe className="w-6 h-6 text-[#D4AF37] shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]">Direct Import</h4>
                  <p className="text-xs text-[#1A1A1A]/40">Sourced directly from USA Brand Outlets.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <DollarSign className="w-6 h-6 text-[#D4AF37] shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]">Fair Pricing</h4>
                  <p className="text-xs text-[#1A1A1A]/40">Transparent costs with no hidden fees.</p>
                </div>
              </div>
            </div>

            <button className="inline-flex items-center space-x-6 group">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#1A1A1A]">Shop All Authentic Brands</span>
              <div className="w-12 h-px bg-[#D4AF37] transition-all group-hover:w-24" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
