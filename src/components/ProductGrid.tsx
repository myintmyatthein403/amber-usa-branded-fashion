"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { ShoppingBag, Eye, Check } from "lucide-react";
import { useState } from "react";
import QuickViewModal from "@/components/modals/QuickViewModal";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

const PRODUCTS = [
  {
    id: 1,
    name: "Coach Signature Canvas Tote",
    price: 325000,
    originalPrice: 450000,
    category: "Coach",
    color: "Tan/Rust",
    sizes: ["One Size"],
    inStock: true,
    onSale: true,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
    secondaryImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    name: "Nike Air Max 270",
    price: 285000,
    originalPrice: 350000,
    category: "Nike",
    color: "White/Black",
    sizes: ["US 7", "US 8", "US 9"],
    inStock: true,
    onSale: true,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
    secondaryImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    name: "Adidas Essentials Hoodie",
    price: 85000,
    category: "Adidas",
    color: "Grey Heather",
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",
    secondaryImage: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 4,
    name: "Ralph Lauren Polo Shirt",
    price: 125000,
    category: "Ralph Lauren",
    color: "Royal Blue",
    sizes: ["M", "L"],
    inStock: false,
    image: "https://images.unsplash.com/photo-1586363104864-50e2187ced2f?auto=format&fit=crop&q=80&w=800",
    secondaryImage: "https://images.unsplash.com/photo-1586363104864-50e2187ced2f?auto=format&fit=crop&q=80&w=800",
  },
];

export default function ProductGrid({ title }: { title: string }) {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  
  const selectedQuickViewProduct = useStore((state) => state.selectedQuickViewProduct);
  const setQuickViewProduct = useStore((state) => state.setQuickViewProduct);
  const addToCart = useStore((state) => state.addToCart);
  const [addingId, setAddingId] = useState<number | null>(null);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    e.preventDefault();
    setAddingId(product.id);
    addToCart(product);
    setTimeout(() => setAddingId(null), 1000);
  };

  return (
    <section className="py-24 px-6 md:px-12 bg-[#FDFDFD]">
      <QuickViewModal 
        product={selectedQuickViewProduct} 
        isOpen={!!selectedQuickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-2">
            <span className="text-[#D4AF37] text-[10px] uppercase font-bold tracking-[0.4em]">USA Authentic</span>
            <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A1A]">{title}</h2>
          </div>
          <button className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]/40 border-b border-transparent hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all pb-1">
            Browse All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTS.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#F5F0E1] shadow-sm">
                <Image
                  src={hoveredProduct === product.id ? product.secondaryImage : product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Floating Actions */}
                <div className="absolute bottom-4 left-4 right-4 flex space-x-2 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <button 
                    disabled={!product.inStock || addingId === product.id}
                    onClick={(e) => handleAddToCart(e, product)}
                    className={cn(
                      "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center space-x-2",
                      addingId === product.id 
                        ? "bg-[#D4AF37] text-white" 
                        : "bg-white text-[#1A1A1A] hover:bg-[#D4AF37] hover:text-white"
                    )}
                  >
                    {addingId === product.id ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                    <span>{addingId === product.id ? "Added" : "Quick Buy"}</span>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
                    className="w-12 h-12 bg-white text-[#1A1A1A] flex items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Brand Badge */}
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <span className="bg-[#1A1A1A]/80 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm">
                    {product.category}
                  </span>
                  {product.id === 1 || product.id === 2 ? (
                    <div className="bg-red-500 text-white text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm shadow-lg">
                      SALE
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center text-center space-y-1">
                <a href={`/shop/${product.id}`} className="block group-hover:translate-y-[-2px] transition-transform">
                  <h3 className="text-lg font-serif text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors">
                    {product.name}
                  </h3>
                </a>
                <div className="flex items-center space-x-3">
                  <p className="text-sm text-[#D4AF37] font-bold tracking-widest">{product.price.toLocaleString()} MMK</p>
                  {(product.id === 1 || product.id === 2) && (
                    <p className="text-[10px] text-[#1A1A1A]/30 font-bold tracking-widest line-through">
                      {(product.price * 1.3).toLocaleString()} MMK
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
