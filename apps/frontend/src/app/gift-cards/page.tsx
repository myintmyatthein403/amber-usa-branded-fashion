"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  CreditCard,
  Gift,
  Send,
  Check,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { Product } from "@amber/shared";

interface GiftCardOptionParsed {
  id: string;
  value: number;
  label: string;
}

const GIFT_CARD_VALUES = [
  { id: "gc-50", value: 50000, label: "50,000 MMK" },
  { id: "gc-100", value: 100000, label: "100,000 MMK" },
  { id: "gc-200", value: 200000, label: "200,000 MMK" },
  { id: "gc-500", value: 500000, label: "500,000 MMK" },
];

export default function GiftCardsPage() {
  const [data, setData] = useState<any>({
    badge: "The Ultimate Gift",
    title: "The Amber",
    titleSecondary: "Gift Experience",
    description: "Give the gift of choice. Perfect for any occasion, our digital gift cards allow your loved ones to shop their favorite authentic USA brands in Myanmar.",
    cardTitle: "Amber",
    cardType: "Gift Card",
    cardAmount: "100,000 MMK",
    parsedAmounts: ["50,000 MMK", "100,000 MMK", "200,000 MMK", "500,000 MMK"].map((label, index) => ({
      id: `gc-${index}`,
      value: parseInt(label.replace(/,/g, "").replace(/ MMK/g, "")),
      label: label
    }))
  });
  const [selectedAmount, setSelectedAmount] = useState<GiftCardOptionParsed | null>(null);
  const addToCart = useStore((state) => state.addToCart);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    // Set initial selected amount if not set
    if (!selectedAmount && data.parsedAmounts.length > 0) {
      setSelectedAmount(data.parsedAmounts[1]);
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/gift-card-section/active`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((sectionData) => {
        const rawAmounts = (sectionData?.amounts && sectionData.amounts.length > 0) 
          ? sectionData.amounts 
          : ["50,000 MMK", "100,000 MMK", "200,000 MMK", "500,000 MMK"];

        const amounts = rawAmounts.map(
          (label: string, index: number) => ({
            id: `gc-${index}`,
            value: parseInt(label.replace(/,/g, "").replace(/ MMK/g, "")),
            label: label,
          }),
        );
        setData({ ...sectionData, parsedAmounts: amounts });
        setSelectedAmount(amounts[1] || amounts[0]);
      })
      .catch((err) => {
        console.error("API Fetch Error:", err);
      });
  }, []);

  const handleAddGiftCard = () => {
    if (!selectedAmount) return;
    setIsAdding(true);
    const giftCardProduct = {
      id: selectedAmount.id,
      name: `Amber Premium Gift Card - ${selectedAmount.label}`,
      price: selectedAmount.value,
      image:
        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop",
      category: "Gift Card",
      inStock: true,
      sizes: ["Digital"],
      isUsdPrice: false,
    };
    addToCart(giftCardProduct as unknown as Product);
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <main className="relative min-h-screen bg-[#F7F7F7]">
      <Navbar />

      <section className="pt-48 pb-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
          {/* Left: Gift Card Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Ambient Shadow/Glow */}
            <div className="absolute -inset-4 bg-black/5 blur-3xl rounded-[2rem]" />

            <div className="relative aspect-[1.6/1] w-full max-w-lg mx-auto bg-[#1A1A1A] rounded-[2rem] shadow-2xl p-10 flex flex-col justify-between overflow-hidden group">
              <div className="absolute inset-0 acheik-pattern opacity-5" />

              <div className="relative h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <h2 className="text-3xl font-serif tracking-tighter uppercase leading-none text-white">
                      {data.cardTitle}
                    </h2>
                    <span className="text-[9px] uppercase tracking-[0.25em] text-[#D4AF37] mt-1.5 font-bold">
                      Premium USA Brands
                    </span>
                  </div>
                  <Gift className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">
                    {data.cardType} Value
                  </span>
                  <p className="text-5xl font-serif text-[#D4AF37] tracking-tight">
                    {selectedAmount?.label || data.cardAmount}
                  </p>
                </div>

                <div className="flex justify-between items-end pt-4 border-t border-white/5">
                  <div className="space-y-1.5">
                    <span className="text-[8px] uppercase tracking-[0.2em] text-white/20 font-bold">
                      Digital Voucher
                    </span>
                    <p className="text-[10px] tracking-[0.4em] font-mono text-white/40 uppercase">
                      XXXX • XXXX • XXXX • 2026
                    </p>
                  </div>
                  {/* Holographic Chip Effect */}
                  <div className="w-14 h-10 bg-gradient-to-br from-[#D4AF37]/40 via-[#F5F0E1]/20 to-[#D4AF37]/40 rounded-lg backdrop-blur-sm border border-white/10" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Selection & Details */}
          <div className="space-y-12">
            <div className="space-y-6">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#D4AF37] text-[11px] uppercase font-bold tracking-[0.5em] block"
              >
                {data.badge}
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-7xl font-serif text-[#1A1A1A] leading-[1.1] tracking-tight"
              >
                {data.title} <br /> {data.titleSecondary}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[#1A1A1A]/50 text-lg leading-relaxed font-sans max-w-md"
              >
                {data.description}
              </motion.p>
            </div>

            <div className="space-y-8">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#1A1A1A]">
                Select Amount
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {data.parsedAmounts?.map((option: GiftCardOptionParsed, index: number) => (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    key={option.id}
                    onClick={() => setSelectedAmount(option)}
                    className={cn(
                      "py-6 px-8 border text-[11px] font-bold uppercase tracking-[0.25em] transition-all duration-300 text-center relative overflow-hidden",
                      selectedAmount?.id === option.id
                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-2xl shadow-black/10 scale-[1.02] z-10"
                        : "bg-white/50 border-[#1A1A1A]/5 text-[#1A1A1A]/40 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-white",
                    )}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="pt-6"
            >
              <button
                onClick={handleAddGiftCard}
                disabled={isAdding}
                className={cn(
                  "w-full py-7 uppercase tracking-[0.5em] text-[11px] font-bold transition-all duration-500 flex items-center justify-center space-x-4 shadow-2xl active:scale-[0.98]",
                  isAdding
                    ? "bg-[#D4AF37] text-white shadow-[#D4AF37]/20"
                    : "bg-[#1A1A1A] text-white hover:bg-primary shadow-black/20",
                )}
              >
                <AnimatePresence mode="wait">
                  {isAdding ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check className="w-5 h-5" strokeWidth={2.5} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="bag"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <ShoppingBag className="w-5 h-5" strokeWidth={2} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span>
                  {isAdding ? "Added to Bag" : "Add Gift Card to Bag"}
                </span>
              </button>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
