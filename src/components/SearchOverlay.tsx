"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, ArrowRight, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const MOCK_PRODUCTS = [
  { id: 1, name: "Coach Signature Canvas Tote", price: "325,000 MMK", category: "Coach", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800" },
  { id: 2, name: "Nike Air Max 270", price: "285,000 MMK", category: "Nike", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800" },
  { id: 3, name: "Adidas Essentials Hoodie", price: "85,000 MMK", category: "Adidas", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800" },
  { id: 4, name: "Ralph Lauren Polo Shirt", price: "125,000 MMK", category: "Ralph Lauren", image: "https://images.unsplash.com/photo-1586363104864-50e2187ced2f?auto=format&fit=crop&q=80&w=800" },
];

export default function SearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (query.length > 1) {
      const filtered = MOCK_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

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
              {query.length > 0 && results.length === 0 ? (
                <div className="py-24 text-center space-y-4">
                  <p className="text-xl font-serif">No results found for &quot;{query}&quot;</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/40">Try searching for Nike, Coach, or Adidas</p>
                </div>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                  {results.map((product) => (
                    <Link 
                      key={product.id} 
                      href={`/shop/${product.id}`}
                      onClick={onClose}
                      className="group"
                    >
                      <div className="relative aspect-[3/4] bg-[#F5F0E1] overflow-hidden rounded-sm mb-6">
                        <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-[#D4AF37]">{product.category}</span>
                        <h4 className="text-sm font-serif font-bold text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors">{product.name}</h4>
                        <p className="text-xs font-bold text-[#1A1A1A]/40">{product.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#1A1A1A]/40">Popular Brands</h4>
                    <div className="flex flex-wrap gap-4">
                      {["Nike", "Coach", "Adidas", "Ralph Lauren", "Tommy Hilfiger", "Calvin Klein"].map(brand => (
                        <button 
                          key={brand}
                          onClick={() => setQuery(brand)}
                          className="px-8 py-4 border border-[#1A1A1A]/10 text-[10px] font-bold uppercase tracking-widest hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
                        >
                          {brand}
                        </button>
                      ))}
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
