"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, CreditCard, Gift, Send, Check, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";

const GIFT_CARD_VALUES = [
  { id: "gc-50", value: 50000, label: "50,000 MMK" },
  { id: "gc-100", value: 100000, label: "100,000 MMK" },
  { id: "gc-200", value: 200000, label: "200,000 MMK" },
  { id: "gc-500", value: 500000, label: "500,000 MMK" },
];

export default function GiftCardsPage() {
  const [selectedAmount, setSelectedAmount] = useState(GIFT_CARD_VALUES[1]);
  const addToCart = useStore((state) => state.addToCart);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddGiftCard = () => {
    setIsAdding(true);
    const giftCardProduct = {
      id: selectedAmount.id,
      name: `Amber Premium Gift Card - ${selectedAmount.label}`,
      price: selectedAmount.value,
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop",
      category: "Gift Card",
      inStock: true,
      sizes: ["Digital"]
    };
    addToCart(giftCardProduct);
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <main className="relative min-h-screen bg-[#FDFDFD]">
      <Navbar />

      <section className="pt-40 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left: Gift Card Visual */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, rotateY: -20 }}
              animate={{ opacity: 1, rotateY: 0 }}
              className="relative aspect-[1.6/1] w-full max-w-lg mx-auto bg-gradient-to-br from-[#1A1A1A] to-[#333333] rounded-2xl shadow-2xl p-8 overflow-hidden group perspective-1000"
            >
              <div className="absolute inset-0 acheik-pattern opacity-10" />
              <div className="relative h-full flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-serif tracking-tighter uppercase leading-none">Amber</h2>
                    <span className="text-[8px] uppercase tracking-[0.3em] text-[#D4AF37] mt-1 font-bold">Premium USA Brands</span>
                  </div>
                  <Gift className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Gift Card Value</span>
                  <p className="text-4xl font-serif text-[#D4AF37]">{selectedAmount.label}</p>
                </div>
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase tracking-[0.2em] text-white/20 font-bold">Digital Voucher</span>
                    <p className="text-[10px] tracking-[0.3em] font-mono text-white/60">XXXX • XXXX • XXXX • 2026</p>
                  </div>
                  <div className="w-12 h-8 bg-gradient-to-r from-[#D4AF37] to-[#F5F0E1] rounded opacity-20" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Selection & Details */}
          <div className="space-y-10">
            <div className="space-y-4">
              <span className="text-[#D4AF37] text-[10px] uppercase font-bold tracking-[0.4em] block">Exclusive Gift</span>
              <h1 className="text-5xl md:text-6xl font-serif text-[#1A1A1A] leading-tight">The Amber <br /> Gift Experience</h1>
              <p className="text-[#1A1A1A]/60 text-lg leading-relaxed font-sans max-w-md">
                Give the gift of choice. Perfect for any occasion, our digital gift cards allow your loved ones to shop their favorite authentic USA brands in Myanmar.
              </p>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Select Amount</h4>
              <div className="grid grid-cols-2 gap-4">
                {GIFT_CARD_VALUES.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedAmount(option)}
                    className={cn(
                      "py-5 px-6 border text-xs font-bold uppercase tracking-widest transition-all text-center",
                      selectedAmount.id === option.id 
                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xl" 
                        : "border-[#1A1A1A]/10 text-[#1A1A1A]/60 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <button
                onClick={handleAddGiftCard}
                disabled={isAdding}
                className={cn(
                  "w-full py-6 uppercase tracking-[0.4em] text-xs font-bold transition-all flex items-center justify-center space-x-4 shadow-xl active:scale-95",
                  isAdding ? "bg-[#D4AF37] text-white" : "bg-[#1A1A1A] text-white hover:bg-[#D4AF37]"
                )}
              >
                {isAdding ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                <span>{isAdding ? "Added to Bag" : "Add Gift Card to Bag"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
