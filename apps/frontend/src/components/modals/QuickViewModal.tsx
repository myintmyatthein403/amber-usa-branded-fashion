"use client";

import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { X, ShoppingBag, Heart, Star, ShieldCheck, Truck, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";
import SizeGuideModal from "./SizeGuideModal";
import { useStore } from "@/store/useStore";
import Price from "../Price";

interface Product {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  isUsdPrice?: boolean;
  onSale?: boolean;
  category: string;
  color: string;
  colors?: string[];
  sizes: string[];
  inStock: boolean;
  image: string;
  images?: string[];
  description?: string;
  variants?: any[];
}

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [userSelectedImage, setUserSelectedImage] = useState<string | null>(null);
  
  const addToCart = useStore((state) => state.addToCart);
  const addToCompare = useStore((state) => state.addToCompare);
  const [isAdding, setIsAdding] = useState(false);

  const allImages = useMemo(() => {
    if (!product) return [];
    const images = [...(product.images || [])];
    
    product.variants?.forEach((v: any) => {
      v.images?.forEach((img: string) => {
        if (!images.includes(img)) {
          images.push(img);
        }
      });
    });
    
    return images;
  }, [product]);

  const activeImage = useMemo(() => {
    if (!product) return "";
    
    if (userSelectedImage) return userSelectedImage;

    if (selectedSize || selectedColor) {
      const variant = product.variants?.find((v: any) => {
        const matchesSize = selectedSize ? v.size === selectedSize : true;
        const matchesColor = selectedColor ? v.color === selectedColor : true;
        return matchesSize && matchesColor;
      });

      if (variant?.images && variant.images.length > 0) {
        return variant.images[0];
      }
    }
    
    return product.image;
  }, [product, selectedSize, selectedColor, userSelectedImage]);

  // Reset user selection when variant attributes change to allow variant image to take over
  useEffect(() => {
    setUserSelectedImage(null);
  }, [selectedSize, selectedColor]);

  if (!product) return null;

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes?.length > 0) {
      alert("Please select a size");
      return;
    }
    if (!selectedColor && product.colors && product.colors.length > 0) {
      alert("Please select a color");
      return;
    }
    setIsAdding(true);
    
    // Find the actual variant ID based on selected size/color
    const selectedVariant = product.variants?.find((v: any) => {
      const matchesSize = selectedSize ? v.size === selectedSize : true;
      const matchesColor = selectedColor ? v.color === selectedColor : true;
      return matchesSize && matchesColor;
    });
    
    addToCart(
      product, 
      selectedSize || undefined, 
      selectedVariant?.id,
      undefined,
      undefined,
      selectedColor || undefined,
      selectedVariant?.price ? Number(selectedVariant.price) : undefined,
      selectedVariant?.images?.[0] || undefined
    );
    setTimeout(() => {
      setIsAdding(false);
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative w-full max-w-5xl bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:h-[700px] rounded-none"
            >
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-20 p-3 bg-white/90 backdrop-blur-md rounded-none text-[#0F0F0F] hover:bg-[#0F0F0F] hover:text-white transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left: Product Image & Gallery */}
              <div className="w-full md:w-1/2 flex flex-col bg-[#FAF8F5] overflow-hidden group">
                <div className="relative flex-1 min-h-[400px]">
                  <Image
                    src={activeImage || product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                  
                  {/* Authentic Badge */}
                  <div className="absolute top-8 left-8 bg-[#0F0F0F] text-[#C9A962] px-5 py-2.5 text-[10px] font-bold tracking-[0.2em] shadow-xl">
                    100% AUTHENTIC
                  </div>

                  {product.onSale && (
                    <div className="absolute bottom-8 left-8 bg-[#F87171] text-white px-5 py-2.5 text-[10px] font-bold tracking-[0.2em]">
                      SALE
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar bg-white/50 backdrop-blur-sm border-t border-[#F0F0F0]">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setUserSelectedImage(img)}
                        className={cn(
                          "relative w-16 h-20 flex-shrink-0 bg-white overflow-hidden transition-all duration-300 border",
                          activeImage === img ? "border-[#C9A962] opacity-100" : "border-transparent opacity-40 hover:opacity-100"
                        )}
                      >
                        <Image src={img} alt={`${product.name} ${idx}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Details */}
              <div className="w-full md:w-1/2 p-10 md:p-14 overflow-y-auto bg-white flex flex-col">
                <div className="space-y-10 my-auto">
                  <header className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#C9A962] font-bold tracking-[0.25em] uppercase">
                        {product.category || "New Collection"}
                      </span>
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-[#C9A962] fill-[#C9A962]" />
                          ))}
                        </div>
                        <span className="text-[10px] text-[#888888] font-semibold tracking-wider uppercase">(48 Reviews)</span>
                      </div>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-serif text-[#0F0F0F] leading-tight">
                      {product.name}
                    </h2>
                    
                    <div className="flex items-center space-x-5">
                      <Price amount={product.price} isUsdPrice={product.isUsdPrice !== false} className="text-2xl text-[#0F0F0F] font-semibold tracking-tight" />
                      {product.onSale && product.originalPrice && (
                        <Price amount={product.originalPrice} isUsdPrice={product.isUsdPrice !== false} className="text-lg text-[#888888] font-normal line-through opacity-60" />
                      )}
                    </div>
                  </header>

                  <p className="text-[15px] text-[#666666] leading-relaxed font-normal">
                    {product.description || "Expertly crafted from premium materials, this piece embodies our commitment to timeless elegance and modern functionality. A signature addition to any sophisticated wardrobe."}
                  </p>

                  <div className="grid grid-cols-1 gap-8">
                    {/* Color Selection */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="space-y-4">
                        <span className="text-[11px] font-bold tracking-[0.15em] text-[#0F0F0F] uppercase border-b border-[#F0F0F0] pb-2 block">
                          Select Color
                        </span>
                        <div className="flex flex-wrap gap-3">
                          {product.colors.map((color: string) => (
                            <button
                              key={color}
                              onClick={() => setSelectedColor(color)}
                              className={cn(
                                "px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border",
                                selectedColor === color
                                  ? "bg-[#0F0F0F] text-white border-[#0F0F0F]"
                                  : "bg-white text-[#0F0F0F] border-[#E5E5E5] hover:border-[#C9A962]"
                              )}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Size Selection */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-end border-b border-[#F0F0F0] pb-2">
                          <span className="text-[11px] font-bold tracking-[0.15em] text-[#0F0F0F] uppercase">Select Size</span>
                          <button 
                            onClick={() => setIsSizeGuideOpen(true)}
                            className="text-[10px] text-[#C9A962] font-bold tracking-[0.15em] uppercase hover:opacity-70 transition-opacity"
                          >
                            Size Guide
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          {product.sizes.map((size) => (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className={cn(
                                "aspect-square flex items-center justify-center text-[12px] font-bold transition-all duration-300 border rounded-none",
                                selectedSize === size
                                  ? "bg-[#0F0F0F] text-white border-[#0F0F0F]"
                                  : "bg-white text-[#0F0F0F] border-[#E5E5E5] hover:border-[#C9A962] hover:text-[#C9A962]"
                              )}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-4 pt-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={!product.inStock || isAdding}
                      className={cn(
                        "group relative w-full h-16 uppercase tracking-[0.25em] text-[13px] font-bold transition-all duration-500 overflow-hidden rounded-none",
                        isAdding ? "bg-[#C9A962] text-white" : "bg-[#0F0F0F] text-white hover:bg-[#C9A962]"
                      )}
                    >
                      <div className="flex items-center justify-center space-x-4 relative z-10">
                        {isAdding ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          >
                            <ShoppingBag className="w-5 h-5" />
                          </motion.div>
                        ) : (
                          <ShoppingBag className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
                        )}
                        <span>{isAdding ? "Adding..." : "Add to Shopping Bag"}</span>
                      </div>
                    </button>
                    
                    <div className="flex space-x-3">
                      <button className="flex-1 h-14 border border-[#E5E5E5] text-[#0F0F0F] uppercase tracking-[0.2em] text-[11px] font-bold hover:border-[#0F0F0F] transition-all flex items-center justify-center space-x-3 group rounded-none">
                        <Heart className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span>Wishlist</span>
                      </button>
                      <button 
                        onClick={() => {
                          addToCompare(product);
                          onClose();
                        }}
                        className="flex-1 h-14 border border-[#E5E5E5] text-[#0F0F0F] uppercase tracking-[0.2em] text-[11px] font-bold hover:border-[#0F0F0F] transition-all flex items-center justify-center space-x-3 group rounded-none"
                      >
                        <Scale className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span>Compare</span>
                      </button>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex items-center justify-between pt-10 border-t border-[#F0F0F0]">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-none bg-[#FAF8F5] flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-[#C9A962]" />
                      </div>
                      <span className="text-[10px] tracking-widest font-bold text-[#888888] uppercase">Authentic</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-none bg-[#FAF8F5] flex items-center justify-center">
                        <Truck className="w-5 h-5 text-[#C9A962]" />
                      </div>
                      <span className="text-[10px] tracking-widest font-bold text-[#888888] uppercase">USA Import</span>
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <a
                      href={`/shop/${product.id}`}
                      className="text-[11px] uppercase tracking-[0.35em] font-bold text-[#888888] hover:text-[#C9A962] underline underline-offset-8 decoration-1 transition-all"
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
