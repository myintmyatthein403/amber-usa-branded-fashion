"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { Check, Percent } from "lucide-react";

interface SidebarContentProps {
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedCollection: string;
  setSelectedCollection: (collection: string) => void;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  onlyInStock: boolean;
  setOnlyInStock: (value: boolean) => void;
  onlySale: boolean;
  setOnlySale: (value: boolean) => void;
  products: any[];
  currency: string;
  exchangeRate: number;
  minPriceInput: string;
  maxPriceInput: string;
  setMinPriceInput: (value: string) => void;
  setMaxPriceInput: (value: string) => void;
}

export default function SidebarContent({
  selectedBrand,
  setSelectedBrand,
  selectedCategory,
  setSelectedCategory,
  selectedCollection,
  setSelectedCollection,
  selectedSize,
  setSelectedSize,
  priceRange,
  setPriceRange,
  onlyInStock,
  setOnlyInStock,
  onlySale,
  setOnlySale,
  products,
  currency,
  exchangeRate,
  minPriceInput,
  maxPriceInput,
  setMinPriceInput,
  setMaxPriceInput,
}: SidebarContentProps) {
  const formatPrice = useStore((state) => state.formatPrice);
  
  const maxPrice = currency === 'USD' ? 3000 : 3000 * exchangeRate;

  const brands = useMemo(() => {
    const uniqueBrands = new Set(products.map(p => p.brand).filter(Boolean));
    return ["All", ...Array.from(uniqueBrands).sort()];
  }, [products]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(products.map(p => p.category).filter(Boolean));
    return ["All", ...Array.from(uniqueCategories).sort()];
  }, [products]);

  const collections = useMemo(() => {
    const uniqueCollections = new Set(products.flatMap(p => p.collections || []));
    return ["All", ...Array.from(uniqueCollections).sort()];
  }, [products]);

  const sizes = useMemo(() => {
    const allSizes = products.flatMap(p => p.sizes || []);
    return ["All", ...Array.from(new Set(allSizes)).sort()];
  }, [products]);

  const handleMinPriceChange = useCallback((value: string) => {
    setMinPriceInput(value);
  }, [setMinPriceInput]);

  const handleMaxPriceChange = useCallback((value: string) => {
    setMaxPriceInput(value);
  }, [setMaxPriceInput]);

  const handleMinPriceBlur = useCallback(() => {
    const cleaned = minPriceInput.replace(/[^0-9]/g, '');
    const numValue = parseInt(cleaned, 10) || 0;
    setMinPriceInput(numValue.toLocaleString());
    setPriceRange([Math.min(numValue, priceRange[1] - 1), priceRange[1]]);
  }, [minPriceInput, priceRange, setPriceRange, setMinPriceInput]);

  const handleMaxPriceBlur = useCallback(() => {
    const cleaned = maxPriceInput.replace(/[^0-9]/g, '');
    const numValue = parseInt(cleaned, 10) || 0;
    setMaxPriceInput(numValue.toLocaleString());
    setPriceRange([priceRange[0], Math.max(numValue, priceRange[0] + 1)]);
  }, [maxPriceInput, priceRange, setPriceRange, setMaxPriceInput]);

  const handleClearFilters = useCallback(() => {
    setSelectedBrand("All");
    setSelectedCategory("All");
    setSelectedCollection("All");
    setSelectedSize("All");
    setPriceRange([0, maxPrice]);
    setOnlyInStock(false);
    setOnlySale(false);
    setMinPriceInput("0");
    setMaxPriceInput(maxPrice.toLocaleString());
  }, [setSelectedBrand, setSelectedCategory, setSelectedCollection, setSelectedSize, setPriceRange, setOnlyInStock, setOnlySale, setMinPriceInput, setMaxPriceInput, maxPrice]);

  return (
    <div className="space-y-12">
      {/* Sale Filter */}
      <div className="space-y-4">
        <button 
          onClick={() => setOnlySale(!onlySale)}
          className={cn(
            "flex items-center space-x-3 w-full p-4 border transition-all group",
            onlySale ? "border-red-500 bg-red-50" : "border-[#1A1A1A]/10 hover:border-[#D4AF37]"
          )}
        >
          <div className={cn(
            "w-5 h-5 border flex items-center justify-center",
            onlySale ? "bg-red-500 border-red-500" : "border-[#1A1A1A]/20"
          )}>
            {onlySale && <Check className="w-3 h-3 text-white" />}
          </div>
          <div className="flex items-center space-x-2">
            <Percent className={cn("w-4 h-4", onlySale ? "text-red-500" : "text-[#1A1A1A]/40")} />
            <span className={cn("text-xs font-bold uppercase tracking-widest", onlySale ? "text-red-500" : "text-[#1A1A1A]/60")}>On Sale</span>
          </div>
        </button>
      </div>

      {/* In Stock Filter */}
      <div className="space-y-4">
        <button 
          onClick={() => setOnlyInStock(!onlyInStock)}
          className={cn(
            "flex items-center space-x-3 w-full p-4 border transition-all group",
            onlyInStock ? "border-green-500 bg-green-50" : "border-[#1A1A1A]/10 hover:border-[#D4AF37]"
          )}
        >
          <div className={cn(
            "w-5 h-5 border flex items-center justify-center",
            onlyInStock ? "bg-green-500 border-green-500" : "border-[#1A1A1A]/20"
          )}>
            {onlyInStock && <Check className="w-3 h-3 text-white" />}
          </div>
          <span className={cn("text-xs font-bold uppercase tracking-widest", onlyInStock ? "text-green-600" : "text-[#1A1A1A]/60")}>In Stock Only</span>
        </button>
      </div>

      {/* Collections */}
      <div className="space-y-6">
        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1A1A]">Collections</h4>
        <div className="flex flex-col space-y-4">
          {collections.map((coll) => (
            <button
              key={coll}
              onClick={() => setSelectedCollection(coll)}
              className={cn(
                "text-left text-sm font-medium transition-all hover:text-[#D4AF37]",
                selectedCollection === coll ? "text-[#D4AF37] translate-x-2" : "text-[#1A1A1A]/60"
              )}
            >
              {coll}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-6">
        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1A1A]">Brands</h4>
        <div className="flex flex-col space-y-4">
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={cn(
                "text-left text-sm font-medium transition-all hover:text-[#D4AF37]",
                selectedBrand === brand ? "text-[#D4AF37] translate-x-2" : "text-[#1A1A1A]/60"
              )}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1A1A]">Categories</h4>
        <div className="flex flex-col space-y-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "text-left text-sm font-medium transition-all hover:text-[#D4AF37]",
                selectedCategory === cat ? "text-[#D4AF37] translate-x-2" : "text-[#1A1A1A]/60"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-6">
        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1A1A]">Price Range</h4>
        <div className="space-y-8">
          <div className="relative h-2 w-full bg-[#1A1A1A]/5 rounded-full mt-10">
            <div 
              className="absolute h-full bg-[#D4AF37] rounded-full"
              style={{
                left: `${(priceRange[0] / maxPrice) * 100}%`,
                right: `${100 - (priceRange[1] / maxPrice) * 100}%`
              }}
            />
            <input
              type="range"
              min="0"
              max={maxPrice}
              step={currency === 'USD' ? 10 : 1000}
              value={priceRange[0]}
              onChange={(e) => {
                const val = Math.min(parseInt(e.target.value), priceRange[1] - (maxPrice * 0.05));
                setPriceRange([val, priceRange[1]]);
                setMinPriceInput(val.toLocaleString());
              }}
              className="absolute w-full -top-1 h-2 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#D4AF37] [&::-webkit-slider-thumb]:appearance-none accent-[#D4AF37]"
            />
            <input
              type="range"
              min="0"
              max={maxPrice}
              step={currency === 'USD' ? 10 : 1000}
              value={priceRange[1]}
              onChange={(e) => {
                const val = Math.max(parseInt(e.target.value), priceRange[0] + (maxPrice * 0.05));
                setPriceRange([priceRange[0], val]);
                setMaxPriceInput(val.toLocaleString());
              }}
              className="absolute w-full -top-1 h-2 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#D4AF37] [&::-webkit-slider-thumb]:appearance-none accent-[#D4AF37]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="text-[8px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Min ({currency})</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#1A1A1A]/30">
                  {currency === 'USD' ? '$' : 'K'}
                </span>
                <input 
                  type="text"
                  value={minPriceInput}
                  onChange={(e) => handleMinPriceChange(e.target.value)}
                  onBlur={handleMinPriceBlur}
                  placeholder="0"
                  className="w-full bg-[#1A1A1A]/5 border-none pl-7 pr-3 py-2.5 text-[11px] font-bold outline-none focus:ring-1 focus:ring-[#D4AF37] text-right tracking-wide"
                />
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[8px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Max ({currency})</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#1A1A1A]/30">
                  {currency === 'USD' ? '$' : 'K'}
                </span>
                <input 
                  type="text"
                  value={maxPriceInput}
                  onChange={(e) => handleMaxPriceChange(e.target.value)}
                  onBlur={handleMaxPriceBlur}
                  placeholder={maxPrice.toLocaleString()}
                  className="w-full bg-[#1A1A1A]/5 border-none pl-7 pr-3 py-2.5 text-[11px] font-bold outline-none focus:ring-1 focus:ring-[#D4AF37] text-right tracking-wide"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-6">
        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1A1A]">USA Size</h4>
        <div className="grid grid-cols-3 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={cn(
                "py-2 border text-[10px] font-bold uppercase tracking-widest transition-all",
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

      <button 
        onClick={handleClearFilters}
        className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-600 transition-colors pt-4 block"
      >
        Clear All Filters
      </button>
    </div>
  );
}
