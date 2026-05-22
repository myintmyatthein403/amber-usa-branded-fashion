"use client";

import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { X, ShoppingBag, Heart, Star, ShieldCheck, Truck, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";
import SizeGuideModal from "./SizeGuideModal";
import { useStore } from "@/store/useStore";
import Price from "../Price";
import { Product } from "@amber/shared";
import { getApiUrl } from "@/lib/api";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FilterableAttribute {
  id: string;
  name: string;
  slug: string;
  type: string;
  values: Array<{
    id: string;
    value: string;
    slug: string;
    hexColor?: string | null;
  }>;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [userSelectedImage, setUserSelectedImage] = useState<string | null>(null);
  const [filterableAttributes, setFilterableAttributes] = useState<FilterableAttribute[]>([]);
  
  const addToCart = useStore((state) => state.addToCart);
  const addToCompare = useStore((state) => state.addToCompare);
  const currency = useStore((state) => state.currency);
  const exchangeRate = useStore((state) => state.exchangeRate);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchAttributes = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/attributes/public`);
        const result = await res.json();
        setFilterableAttributes(
          (Array.isArray(result) ? result : result?.data ?? []) as FilterableAttribute[],
        );
      } catch {
        setFilterableAttributes([]);
      }
    };
    fetchAttributes();
  }, [isOpen]);

  const productAttributes = useMemo(() => {
    if (!product?.variants?.length || !filterableAttributes.length) return [];
    
    const usedValueIdsByAttr: Record<string, Set<string>> = {};
    
    product.variants.forEach((v: any) => {
      Object.entries(v.attributeSelections || {}).forEach(([attrId, valueId]) => {
        if (!usedValueIdsByAttr[attrId]) {
          usedValueIdsByAttr[attrId] = new Set();
        }
        usedValueIdsByAttr[attrId].add(valueId as string);
      });
    });

    return filterableAttributes
      .filter((a) => usedValueIdsByAttr[a.id])
      .map((a) => ({
        ...a,
        values: a.values.filter((v) => usedValueIdsByAttr[a.id].has(v.id)),
      }));
  }, [product, filterableAttributes]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    const required = productAttributes.map((a) => a.id);
    if (required.some((id) => !selectedAttributes[id])) return null;
    return (
      product.variants.find((v: any) =>
        required.every(
          (attrId) => v.attributeSelections?.[attrId] === selectedAttributes[attrId],
        ),
      ) ?? null
    );
  }, [product, productAttributes, selectedAttributes]);

  const allImages = useMemo(() => {
    if (!product) return [];
    const images = [...(product.images || [])];
    
    product.variants?.forEach((v) => {
      v.images?.forEach((img) => {
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

    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      return selectedVariant.images[0];
    }
    
    return product.images?.[0] || "";
  }, [product, selectedVariant, userSelectedImage]);

  if (!product) return null;

  const handleAddToCart = () => {
    if (productAttributes.length > 0 && !selectedVariant) {
      alert("Please select all options");
      return;
    }
    setIsAdding(true);
    
    addToCart(
      product, 
      selectedVariant?.size || undefined, 
      selectedVariant?.id,
      product.isPreOrder,
      product.preOrderShippingDate || undefined,
      selectedVariant?.color || undefined,
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
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

              <div className="w-full md:w-1/2 flex flex-col bg-[#FAF8F5] overflow-hidden group">
                <div className="relative flex-1 min-h-[400px]">
                  <Image
                    src={activeImage || product.images?.[0] || ""}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                  
                  <div className="absolute top-8 left-8 bg-[#0F0F0F] text-[#C9A962] px-5 py-2.5 text-[10px] font-bold tracking-[0.2em] shadow-xl">
                    100% AUTHENTIC
                  </div>

                  {product.onSale && (
                    <div className="absolute bottom-8 left-8 bg-[#F87171] text-white px-5 py-2.5 text-[10px] font-bold tracking-[0.2em]">
                      SALE
                    </div>
                  )}
                </div>

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

              <div className="w-full md:w-1/2 p-10 md:p-14 overflow-y-auto bg-white flex flex-col">
                <div className="space-y-10 my-auto">
                  <header className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#C9A962] font-bold tracking-[0.25em] uppercase">
                        {product.category?.name || "New Collection"}
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
                      <Price amount={Number(selectedVariant?.price ?? product.price)} isUsdPrice={product.isUsdPrice !== false} className="text-2xl text-[#0F0F0F] font-semibold tracking-tight" />
                      {product.onSale && product.compareAtPrice && (
                        <Price amount={Number(product.compareAtPrice)} isUsdPrice={product.isUsdPrice !== false} className="text-lg text-[#888888] font-normal line-through opacity-60" />
                      )}
                    </div>
                  </header>

                  <p className="text-[15px] text-[#666666] leading-relaxed font-normal">
                    {product.description || "Expertly crafted from premium materials, this piece embodies our commitment to timeless elegance and modern functionality. A signature addition to any sophisticated wardrobe."}
                  </p>

                  <div className="grid grid-cols-1 gap-8">
                    {productAttributes.map((attr) => (
                      <div key={attr.id} className="space-y-4">
                        <div className="flex justify-between items-end border-b border-[#F0F0F0] pb-2">
                          <span className="text-[11px] font-bold tracking-[0.15em] text-[#0F0F0F] uppercase">
                            Select {attr.name}
                          </span>
                          {(attr.slug === "size" || attr.name.toLowerCase().includes("size")) && (
                            <button 
                              onClick={() => setIsSizeGuideOpen(true)}
                              className="text-[10px] text-[#C9A962] font-bold tracking-[0.15em] uppercase hover:opacity-70 transition-opacity"
                            >
                              Size Guide
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {attr.values.map((val) => {
                            const isSelected = selectedAttributes[attr.id] === val.id;
                            const isColor = attr.type === "color";
                            
                            return (
                              <button
                                key={val.id}
                                onClick={() => setSelectedAttributes(prev => ({ ...prev, [attr.id]: val.id }))}
                                className={cn(
                                  "px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center gap-2",
                                  isSelected
                                    ? "bg-[#0F0F0F] text-white border-[#0F0F0F]"
                                    : "bg-white text-[#0F0F0F] border-[#E5E5E5] hover:border-[#C9A962]"
                                )}
                              >
                                {isColor && (
                                  <span 
                                    className="w-3 h-3 rounded-full border border-white/20"
                                    style={{ backgroundColor: val.hexColor || "#D4AF37" }}
                                  />
                                )}
                                {val.value}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 pt-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={(!product.isPreOrder && !product.variants?.some(v => v.stock > 0)) || isAdding}
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
