"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Gift, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AnnouncementModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [ad, setAd] = useState<any>(null);

  useEffect(() => {
    // Fetch POPUP ads
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads/active?placement=POPUP`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          setAd(data[0]);
        }
      })
      .catch(console.error);

    // Show modal after 2 seconds delay
    const hasSeenModal = localStorage.getItem("hasSeenAnnouncement");
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenAnnouncement", "true");
  };

  const adContent = ad || {
    title: "Join the Amber Elite",
    description: "Subscribe to our newsletter and receive an instant 10,000 MMK voucher for your first authentic USA brand purchase.",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
    badge: "Member Exclusive"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative w-full max-w-4xl bg-white shadow-2xl overflow-hidden flex flex-col md:row md:flex-row rounded-sm"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full text-[#1A1A1A] hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left: Visual Side */}
            <div className="w-full md:w-1/2 relative aspect-square md:aspect-auto h-[300px] md:h-auto bg-[#F5F0E1] overflow-hidden">
              <Image
                src={adContent.imageUrl}
                alt={adContent.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{adContent.badge || 'Limited Offer'}</span>
                </div>
                <h3 className="text-2xl font-serif">{adContent.title}</h3>
              </div>
            </div>

            {/* Right: Content Side */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white relative">
              <div className="absolute inset-0 acheik-pattern opacity-5 pointer-events-none" />
              
              <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                  <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em]">{adContent.badge || 'PROMOTION'}</span>
                  <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A1A] leading-tight">
                    {adContent.title}
                  </h2>
                  <p className="text-[#1A1A1A]/60 text-sm leading-relaxed">
                    {adContent.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <input 
                      type="email" 
                      placeholder="Your Email Address" 
                      className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 outline-none focus:border-[#D4AF37] transition-all text-sm"
                    />
                  </div>
                  {adContent.linkUrl ? (
                    <Link href={adContent.linkUrl}>
                      <button className="w-full bg-[#1A1A1A] text-white py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#D4AF37] transition-all flex items-center justify-center space-x-4 group">
                        <span>Claim My Voucher</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                      </button>
                    </Link>
                  ) : (
                    <button className="w-full bg-[#1A1A1A] text-white py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#D4AF37] transition-all flex items-center justify-center space-x-4 group">
                      <span>Claim My Voucher</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                    </button>
                  )}
                </div>

                <button 
                  onClick={handleClose}
                  className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A]/30 hover:text-[#1A1A1A] transition-colors block mx-auto"
                >
                  No thanks, I prefer paying full price
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
