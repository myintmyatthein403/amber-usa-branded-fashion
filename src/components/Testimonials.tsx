"use client";

import { motion, AnimatePresence } from "motion/react";
import { Quote, Star, ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    id: 1,
    text: "Amber Premium has completely changed how I shop for USA brands. No more worrying about fakes or paying double the price. The authenticity check process gave me so much peace of mind.",
    author: "Daw Nan Khin",
    location: "Yangon",
    role: "Verified Buyer"
  },
  {
    id: 2,
    text: "The delivery is incredibly fast. I ordered a Coach bag on Tuesday and it arrived by Wednesday afternoon in Mandalay. Excellent service and the packaging was beautiful.",
    author: "Ko Min Thu",
    location: "Mandalay",
    role: "Platinum Member"
  },
  {
    id: 3,
    text: "Fair prices and genuine items. It's hard to find a trustworthy shop like this in Myanmar. I've recommended Amber to all my friends who love Nike and Adidas.",
    author: "Ma Thiri",
    location: "Naypyidaw",
    role: "Verified Buyer"
  }
];

export default function Testimonials() {
  const [activeIndex, setActiveTab] = useState(0);

  const next = () => setActiveTab((prev) => (prev + 1) % TESTIMONIALS.length);
  const prev = () => setActiveTab((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <section className="py-32 px-6 md:px-12 bg-[#F5F0E1]/20 relative overflow-hidden">
      {/* Decorative large quote in background */}
      <Quote className="absolute top-10 left-10 w-64 h-64 text-[#D4AF37]/5 -rotate-12 pointer-events-none" />
      
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center text-center space-y-12">
          <div className="space-y-4">
            <span className="text-[#D4AF37] text-[10px] uppercase font-bold tracking-[0.5em] block">Customer Voices</span>
            <h2 className="text-5xl md:text-7xl font-serif text-[#1A1A1A]">What They Say</h2>
          </div>

          <div className="relative w-full min-h-[300px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-10"
              >
                <p className="text-xl md:text-3xl font-serif text-[#1A1A1A] leading-relaxed italic max-w-3xl mx-auto">
                  &quot;{TESTIMONIALS[activeIndex].text}&quot;
                </p>
                
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                    ))}
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]">
                    {TESTIMONIALS[activeIndex].author}
                  </h4>
                  <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 font-bold">
                    {TESTIMONIALS[activeIndex].location} • {TESTIMONIALS[activeIndex].role}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-12">
            <button 
              onClick={prev}
              className="p-4 border border-[#1A1A1A]/10 rounded-full hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all group"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            </button>
            
            <div className="flex space-x-3">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-500",
                    activeIndex === i ? "bg-[#D4AF37] w-8" : "bg-[#1A1A1A]/10 hover:bg-[#1A1A1A]/30"
                  )}
                />
              ))}
            </div>

            <button 
              onClick={next}
              className="p-4 border border-[#1A1A1A]/10 rounded-full hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all group"
            >
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
