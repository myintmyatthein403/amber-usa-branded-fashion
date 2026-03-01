"use client";

import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { X, ShoppingBag, Heart, Star, ShieldCheck, Truck, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import SizeGuideModal from "./SizeGuideModal";
import { useStore } from "@/store/useStore";

interface Product {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  onSale?: boolean;
  category: string;
  color: string;
  sizes: string[];
  inStock: boolean;
  image: string;
  description?: string;
}

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  
  const addToCart = useStore((state) => state.addToCart);
  const addToCompare = useStore((state) => state.addToCompare);
  const [isAdding, setIsAdding] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes.length > 0) {
      alert("Please select a size");
      return;
    }
    setIsAdding(true);
    addToCart(product, selectedSize || undefined);
    setTimeout(() => {
      setIsAdding(false);
      onClose(); // Auto close on add for smoother UX
    }, 800);
  };

  return (
    <>
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
      
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[600px] rounded-sm"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-[#1A1A1A] hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left: Product Image */}
              <div className="w-full md:w-1/2 relative aspect-square md:aspect-auto bg-[#F5F0E1]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                {product.onSale && (
                  <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest shadow-lg">
                    USA Sale
                  </div>
                )}
              </div>

              {/* Right: Details */}
              <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto bg-[#FDFDFD]">
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex space-x-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                        ))}
                      </div>
                      <span className="text-[10px] text-[#1A1A1A]/40 font-bold uppercase tracking-widest">(24 Reviews)</span>
                    </div>
                    <h2 className="text-3xl font-serif text-[#1A1A1A] mb-2">{product.name}</h2>
                    <div className="flex items-center space-x-4">
                      <p className="text-xl text-[#D4AF37] font-bold">{product.price.toLocaleString()} MMK</p>
                      {product.onSale && product.originalPrice && (
                        <>
                          <p className="text-sm text-[#1A1A1A]/30 font-bold line-through">
                            {product.originalPrice.toLocaleString()} MMK
                          </p>
                          <span className="bg-red-500 text-white text-[8px] font-bold uppercase px-2 py-1 rounded-sm">
                            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-[#1A1A1A]/60 leading-relaxed font-sans">
                    {product.description || "A signature piece from our collection, blending premium USA fashion with modern functionality. 100% Authentic guaranteed."}
                  </p>

                  {/* Size Selection */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Select Size</span>
                      <button 
                        onClick={() => setIsSizeGuideOpen(true)}
                        className="text-[10px] text-[#D4AF37] border-b border-[#D4AF37] font-bold uppercase tracking-widest"
                      >
                        Size Guide
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "min-w-[50px] py-3 border text-[10px] font-bold uppercase tracking-widest transition-all",
                            selectedSize === size
                              ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                              : "border-[#1A1A1A]/10 text-[#1A1A1A]/60 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-3 pt-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={!product.inStock || isAdding}
                      className={cn(
                        "w-full py-4 uppercase tracking-[0.2em] text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3",
                        isAdding ? "bg-[#D4AF37] text-white" : "bg-[#1A1A1A] text-white hover:bg-[#D4AF37]"
                      )}
                    >
                      {isAdding ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <ShoppingBag className="w-4 h-4" />
                      )}
                      <span>{isAdding ? "Adding..." : "Add to Shopping Bag"}</span>
                    </button>
                    <div className="flex space-x-2">
                      <button className="flex-1 border border-[#1A1A1A]/10 text-[#1A1A1A] py-4 uppercase tracking-[0.2em] text-[10px] font-bold hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all flex items-center justify-center space-x-2">
                        <Heart className="w-4 h-4" />
                        <span>Wishlist</span>
                      </button>
                      <button 
                        onClick={() => {
                          addToCompare(product);
                          onClose();
                        }}
                        className="flex-1 border border-[#1A1A1A]/10 text-[#1A1A1A] py-4 uppercase tracking-[0.2em] text-[10px] font-bold hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all flex items-center justify-center space-x-2"
                      >
                        <Scale className="w-4 h-4" />
                        <span>Compare</span>
                      </button>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-2 gap-4 pt-8 border-t border-[#1A1A1A]/5">
                    <div className="flex items-center space-x-3">
                      <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                      <span className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A]/60">100% Authentic</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Truck className="w-5 h-5 text-[#D4AF37]" />
                      <span className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A]/60">USA Import</span>
                    </div>
                  </div>

                  <div className="text-center pt-4">
                    <a
                      href={`/shop/${product.id}`}
                      className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#1A1A1A]/40 hover:text-[#D4AF37] transition-colors"
                    >
                      View Full Details
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
