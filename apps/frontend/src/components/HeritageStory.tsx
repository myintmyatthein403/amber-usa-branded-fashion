"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

export default function HeritageStory() {
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
                src="https://images.unsplash.com/photo-1537832816519-689ad163238b?auto=format&fit=crop&q=80&w=800" 
                alt="Burmese Textile Weaving" 
                fill 
                className="object-cover" 
              />
            </motion.div>
            
            <motion.div style={{ y: y2 }} className="absolute bottom-0 left-0 w-[350px] h-[500px] shadow-2xl z-0 overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800" 
                alt="Heritage Architecture" 
                fill 
                className="object-cover brightness-75" 
              />
              <div className="absolute inset-0 acheik-pattern opacity-30 mix-blend-overlay" />
            </motion.div>

            {/* Floating Cultural Text Element */}
            <div className="absolute -bottom-10 right-10 bg-[#D4AF37] p-10 text-white shadow-2xl z-20 max-w-[200px]">
              <span className="text-4xl font-serif leading-none italic block mb-4">1984</span>
              <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                Founded in the heart of Yangon, keeping the tradition alive.
              </p>
            </div>
          </div>

          {/* Right: Story Content */}
          <div className="space-y-12">
            <div className="space-y-6">
              <span className="text-[#D4AF37] text-[10px] uppercase font-bold tracking-[0.5em] block">Our Story & Heritage</span>
              <h2 className="text-5xl md:text-7xl font-serif text-[#1A1A1A] leading-[1.1]">
                Woven with <br /> <span className="italic text-[#D4AF37]">Soul</span>
              </h2>
            </div>

            <div className="space-y-8 text-[#1A1A1A]/70 text-lg leading-relaxed font-sans max-w-lg">
              <p>
                Amber Brand Fashion isn&apos;t just about clothing; it&apos;s a revival of Myanmar&apos;s golden era. 
                We believe that every thread tells a story of the hands that spun it and the culture that inspired it.
              </p>
              <p className="text-base">
                Our designs are deeply rooted in the &quot;Acheik&quot; patterns of the Konbaung dynasty, 
                reimagined for the woman who leads today. We collaborate with master weavers from 
                Mandalay and Amarapura to ensure every piece carries the weight of history and the 
                lightness of modern elegance.
              </p>
            </div>

            <div className="pt-8 border-t border-[#1A1A1A]/5 grid grid-cols-2 gap-12">
              <div className="space-y-2">
                <h4 className="text-2xl font-serif text-[#1A1A1A]">100%</h4>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/40">Ethical Silk</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-serif text-[#1A1A1A]">Handmade</h4>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/40">In Myanmar</p>
              </div>
            </div>

            <button className="inline-flex items-center space-x-6 group">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#1A1A1A]">Discover our process</span>
              <div className="w-12 h-px bg-[#D4AF37] transition-all group-hover:w-24" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
