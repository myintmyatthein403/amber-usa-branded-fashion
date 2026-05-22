"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Price from "./Price";
import { useStore } from "@/store/useStore";
import { Product, Brand } from "@amber/shared";

interface SearchResult extends Product {
  image: string;
}

export default function SearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [popularBrands, setPopularBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const market = useStore((state) => state.market);

  useEffect(() => {
    const fetchPopularBrands = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`);
        const responseData = await res.json();
        // Handle potential nested data structure
        const brands = responseData?.data || responseData || [];
        setPopularBrands(Array.isArray(brands) ? brands.slice(0, 6) : []);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      }
    };
    fetchPopularBrands();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length > 1) {
        setIsLoading(true);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?market=${market}&search=${encodeURIComponent(query)}&limit=8`);
          const result = await res.json();
          const data = result?.data || result || [];

          const filtered: SearchResult[] = (data as unknown as any[]).map((p) => ({
            ...p,
            image: p.images?.[0] || "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
          }));
          setResults(filtered); 
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    };

    const timeoutId = setTimeout(fetchResults, 300);
    return () => clearTimeout(timeoutId);
  }, [query, market]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-white flex flex-col"
        >
          {/* Header */}
          <div className="p-6 md:p-12 flex justify-between items-center border-b border-[#1A1A1A]/5">
            <div className="flex items-center space-x-4 flex-1 max-w-2xl mx-auto">
              <Search className="w-6 h-6 text-[#D4AF37]" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search for USA Brands, Products..." 
                className="w-full text-2xl md:text-4xl font-serif outline-none placeholder:text-[#1A1A1A]/10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button onClick={onClose} className="p-4 hover:bg-zinc-100 rounded-full transition-all">
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
              {isLoading ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Searching Master Catalog...</span>
                </div>
              ) : query.length > 0 && results.length === 0 ? (
                <div className="py-24 text-center space-y-4">
                  <p className="text-xl font-serif">No results found for &quot;{query}&quot;</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/40">Try searching for Nike, Coach, or Adidas</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-12">
                  <div className="flex justify-between items-end">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#1A1A1A]/40">Top Results</h4>
                    <Link 
                      href={`/shop?search=${encodeURIComponent(query)}`}
                      onClick={onClose}
                      className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] hover:text-[#1A1A1A] transition-colors flex items-center space-x-2"
                    >
                      <span>Explore All Results</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {results.map((product) => (
                      <Link 
                        key={product.id} 
                        href={`/shop/${product.id}`}
                        onClick={onClose}
                        className="group"
                      >
                        <div className="relative aspect-[3/4] bg-[#F5F0E1] overflow-hidden rounded-sm mb-6">
                          <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold uppercase tracking-widest text-[#D4AF37]">{product.category?.name || "Uncategorized"}</span>
                          <h4 className="text-sm font-serif font-bold text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors">{product.name}</h4>
                          <Price amount={product.price} isUsdPrice={product.isUsdPrice} className="text-xs font-bold text-[#1A1A1A]/40" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#1A1A1A]/40">Popular Brands</h4>
                    <div className="flex flex-wrap gap-4">
                      {popularBrands.length > 0 ? (
                        popularBrands.map(brand => (
                          <button 
                            key={brand.id}
                            onClick={() => setQuery(brand.name)}
                            className="px-8 py-4 border border-[#1A1A1A]/10 text-[10px] font-bold uppercase tracking-widest hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
                          >
                            {brand.name}
                          </button>
                        ))
                      ) : (
                        ["Nike", "Coach", "Adidas", "Ralph Lauren", "Tommy Hilfiger", "Calvin Klein"].map(brand => (
                          <button 
                            key={brand}
                            onClick={() => setQuery(brand)}
                            className="px-8 py-4 border border-[#1A1A1A]/10 text-[10px] font-bold uppercase tracking-widest hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
                          >
                            {brand}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Branding */}
          <div className="p-12 border-t border-[#1A1A1A]/5 flex justify-center">
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-serif tracking-tighter uppercase">Amber</h2>
              <span className="text-[8px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold">Premium USA Brands</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
