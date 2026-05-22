"use client";

import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { X, Check, Minus, Scale } from "lucide-react";
import { useStore } from "@/store/useStore";
import Price from "@/components/Price";

interface Product {
  id: string;
  name: string;
  price: number;
  isUsdPrice?: boolean;
  category: string;
  color: string;
  sizes: string[];
  inStock: boolean;
  image: string;
  description?: string;
}

interface CompareModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
}

export default function CompareModal({ products, isOpen, onClose, onRemove }: CompareModalProps) {
  const addToCart = useStore((state) => state.addToCart);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-12">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 50 }}
            className="relative w-full max-w-6xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] rounded-sm"
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-[#1A1A1A]/5 flex justify-between items-center bg-[#FDFDFD]">
              <div className="flex items-center space-x-3">
                <Scale className="w-6 h-6 text-[#D4AF37]" />
                <h2 className="text-2xl font-serif text-[#1A1A1A]">Product Comparison</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Comparison Table */}
            <div className="flex-1 overflow-auto p-6 md:p-8">
              <div className="min-w-[800px]">
                <div 
                  className="grid gap-x-8"
                  style={{ 
                    gridTemplateColumns: `200px repeat(${products.length}, minmax(200px, 1fr))` 
                  }}
                >
                  {/* Row: Header (Product Images & Names) */}
                  <div className="border-b border-[#1A1A1A]/5" /> {/* Top-left empty cell */}
                  {products.map((product) => (
                    <div key={`header-${product.id}`} className="space-y-4 pb-8 border-b border-[#1A1A1A]/5 relative group text-center">
                      <div className="relative aspect-[3/4] bg-[#F5F0E1] overflow-hidden rounded-sm group mx-auto w-full">
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                        <button 
                          onClick={() => onRemove(product.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-center h-12 flex items-center justify-center px-2">
                         <h3 className="text-sm font-serif font-bold text-[#1A1A1A] line-clamp-2">{product.name}</h3>
                      </div>
                      <button 
                        onClick={() => addToCart(product as any)}
                        disabled={!(product as any).variants?.length}
                        className="w-full bg-[#1A1A1A] text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-all disabled:opacity-50"
                      >
                        Add to Bag
                      </button>
                    </div>
                  ))}

                  {/* Row: Price */}
                  <div className="h-20 flex items-center text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40 border-b border-[#1A1A1A]/5">Price</div>
                  {products.map((product) => (
                    <div key={`price-${product.id}`} className="h-20 flex items-center justify-center text-sm font-bold text-[#D4AF37] border-b border-[#1A1A1A]/5">
                      <Price amount={product.price} isUsdPrice={product.isUsdPrice} />
                    </div>
                  ))}

                  {/* Row: Category */}
                  <div className="h-20 flex items-center text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40 border-b border-[#1A1A1A]/5">Brand</div>
                  {products.map((product) => (
                    <div key={`category-${product.id}`} className="h-20 flex items-center justify-center text-xs font-medium text-[#1A1A1A]/60 border-b border-[#1A1A1A]/5">
                      {product.category}
                    </div>
                  ))}

                  {/* Row: Color */}
                  <div className="h-20 flex items-center text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40 border-b border-[#1A1A1A]/5">Color</div>
                  {products.map((product) => (
                    <div key={`color-${product.id}`} className="h-20 flex items-center justify-center text-xs font-medium text-[#1A1A1A]/60 border-b border-[#1A1A1A]/5">
                      {product.color}
                    </div>
                  ))}

                  {/* Row: Sizes */}
                  <div className="h-20 flex items-center text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40 border-b border-[#1A1A1A]/5">USA Sizes</div>
                  {products.map((product) => (
                    <div key={`sizes-${product.id}`} className="h-20 flex items-center justify-center text-[10px] font-bold text-[#1A1A1A]/40 border-b border-[#1A1A1A]/5 tracking-widest">
                      {product.sizes.join(" • ")}
                    </div>
                  ))}

                  {/* Row: Availability */}
                  <div className="h-20 flex items-center text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40 border-b border-[#1A1A1A]/5">Availability</div>
                  {products.map((product) => (
                    <div key={`stock-${product.id}`} className="h-20 flex items-center justify-center border-b border-[#1A1A1A]/5">
                      {product.inStock ? (
                        <div className="flex items-center space-x-2 text-green-600">
                          <Check className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">In Stock</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-red-500">
                          <Minus className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Out of Stock</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 bg-[#F5F0E1]/30 border-t border-[#1A1A1A]/5 flex justify-center">
              <p className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest font-bold">
                Showing comparison for {products.length} items
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
