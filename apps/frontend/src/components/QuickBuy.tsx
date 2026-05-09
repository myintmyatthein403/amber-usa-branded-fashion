"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { ShoppingBag, Star, Check } from "lucide-react";
import { useQuickBuyActions } from "@/hooks/useQuickBuyActions";
import { cn } from "@/lib/utils";
import Price from "./Price";

export default function QuickBuy() {
  const {
    product,
    loading,
    selectedSize,
    setSelectedSize,
    isAdding,
    activeImage,
    handleQuickAdd
  } = useQuickBuyActions();

  if (loading || !product) return null;

  return (
    <section className="py-24 px-6 md:px-12 bg-[#F5F0E1]/30">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-2xl overflow-hidden flex flex-col lg:flex-row items-center">
          {/* Left: Product Image */}
          <div className="w-full lg:w-1/2 relative aspect-[4/5] lg:aspect-auto h-[600px] overflow-hidden group">
            <Image 
              src={activeImage} 
              alt={product.name} 
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
                {product.name}
              </h2>
              <div className="flex items-center space-x-6">
                <Price amount={product.price} isUsdPrice={product.isUsdPrice} className="text-3xl text-[#D4AF37] font-bold" />
              </div>
            </div>

            <p className="text-[#1A1A1A]/60 text-lg leading-relaxed font-sans">
              {product.shortDescription || "Experience ultimate comfort and style with authentic USA brands. Directly imported to guarantee quality and legitimacy."}
            </p>

            <div className="space-y-6 pt-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Select Size</h4>
                <button className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest border-b border-[#D4AF37]">USA Size Chart</button>
              </div>
              <div className="flex gap-3">
                {product.sizes.map((size: string) => (
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
