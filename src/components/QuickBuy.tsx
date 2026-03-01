"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { ShoppingBag, Star, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

const FEATURED_PRODUCT = {
  id: 101,
  name: "Nike Sportswear Tech Fleece",
  price: 145000,
  originalPrice: 195000,
  category: "New Arrival",
  onSale: true,
  image: "https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?auto=format&fit=crop&q=80&w=800",
  sizes: ["S", "M", "L", "XL"],
  color: "Midnight Navy"
};

export default function QuickBuy() {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const addToCart = useStore((state) => state.addToCart);
  const [isAdding, setIsAdding] = useState(false);

  const handleQuickAdd = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    setIsAdding(true);
    addToCart(FEATURED_PRODUCT, selectedSize);
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <section className="py-24 px-6 md:px-12 bg-[#F5F0E1]/30">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-2xl overflow-hidden flex flex-col lg:flex-row items-center">
          {/* Left: Product Image */}
          <div className="w-full lg:w-1/2 relative aspect-[4/5] lg:aspect-auto h-[600px] overflow-hidden group">
            <Image 
              src={FEATURED_PRODUCT.image} 
              alt={FEATURED_PRODUCT.name} 
              fill 
              className="object-cover transition-transform duration-[2s] group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-black/5" />
            <div className="absolute top-8 left-8">
              <span className="bg-red-500 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] shadow-lg">
                Thingyan Sale
              </span>
            </div>
          </div>

          {/* Right: Interaction */}
          <div className="w-full lg:w-1/2 p-8 md:p-16 lg:p-24 space-y-10">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                  ))}
                </div>
                <span className="text-[10px] text-[#1A1A1A]/40 font-bold uppercase tracking-widest">Trending Global</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-serif text-[#1A1A1A] leading-tight">
                {FEATURED_PRODUCT.name}
              </h2>
              <div className="flex items-center space-x-6">
                <p className="text-3xl text-[#D4AF37] font-bold">{FEATURED_PRODUCT.price.toLocaleString()} MMK</p>
                {FEATURED_PRODUCT.onSale && (
                  <p className="text-lg text-[#1A1A1A]/30 font-bold line-through">
                    {FEATURED_PRODUCT.originalPrice.toLocaleString()} MMK
                  </p>
                )}
              </div>
            </div>

            <p className="text-[#1A1A1A]/60 text-lg leading-relaxed font-sans">
              Experience ultimate comfort and style with the original Nike Tech Fleece. Directly imported from official Nike stores in the USA.
            </p>

            <div className="space-y-6 pt-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Select Size</h4>
                <button className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest border-b border-[#D4AF37]">USA Size Chart</button>
              </div>
              <div className="flex gap-3">
                {FEATURED_PRODUCT.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "w-14 h-14 border text-[10px] font-bold uppercase tracking-widest transition-all rounded-full flex items-center justify-center",
                      selectedSize === size 
                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A] scale-110 shadow-lg" 
                        : "border-[#1A1A1A]/10 text-[#1A1A1A]/60 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleQuickAdd}
              disabled={isAdding}
              className={cn(
                "w-full py-6 uppercase tracking-[0.4em] text-xs font-bold transition-all flex items-center justify-center space-x-4 shadow-xl active:scale-95",
                isAdding ? "bg-[#D4AF37] text-white" : "bg-[#1A1A1A] text-white hover:bg-[#D4AF37]"
              )}
            >
              {isAdding ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
              <span>{isAdding ? "Added to Bag" : "Buy Authentic Now"}</span>
            </button>

            <div className="pt-8 flex items-center justify-center border-t border-[#1A1A1A]/5">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-[#1A1A1A]">Verified</span>
                  <span className="text-[8px] text-[#1A1A1A]/40 uppercase tracking-widest">Original</span>
                </div>
                <div className="w-px h-8 bg-[#1A1A1A]/10" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-[#1A1A1A]">Direct</span>
                  <span className="text-[8px] text-[#1A1A1A]/40 uppercase tracking-widest">From USA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
