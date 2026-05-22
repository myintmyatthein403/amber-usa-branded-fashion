"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { ShoppingBag, Eye, Check } from "lucide-react";
import { useState, useEffect } from "react";
import QuickViewModal from "@/components/modals/QuickViewModal";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import Price from "./Price";
import { Product } from "@amber/shared";

interface ExtendedProduct extends Product {
  data?: {
    brand?: { name: string };
    category?: { name: string };
  };
  image: string;
  secondaryImage?: string;
  inStock: boolean;
  sizes: string[];
  colors: string[];
}

interface ResponseData {
  data: ExtendedProduct[];
}

export default function ProductGrid({ title, filter }: { title: string, filter?: Record<string, string | boolean> }) {
  const [products, setProducts] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  
  const selectedQuickViewProduct = useStore((state) => state.selectedQuickViewProduct);
  const setQuickViewProduct = useStore((state) => state.setQuickViewProduct);
  const addToCart = useStore((state) => state.addToCart);
  const market = useStore((state) => state.market);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('market', market);
        if (filter) {
          Object.entries(filter).forEach(([key, value]) => {
            queryParams.append(key, value.toString());
          });
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams.toString()}`);
        const result = await response.json();
        
        // Handle nested data structure { data: [...] }
        const data: Product[] = Array.isArray(result) ? result : (result?.data || []);
        
        const productsWithImages = data.map((p: any) => {
          const hasVariantStock = p.variants?.some((v: any) => v.stock > 0);
          const hasProductStock = p.stock !== undefined && p.stock > 0;
          const inStock = hasVariantStock || (hasProductStock && (!p.variants || p.variants.length === 0));
          
          return {
            ...p,
            inStock,
            image: p.images?.[0] || "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
            secondaryImage: p.images?.[1] || p.images?.[0] || "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
            sizes: Array.from(new Set(p.variants?.map((v: any) => v.size) || [])),
            colors: Array.from(new Set(p.variants?.map((v: any) => v.color) || [])),
          };
        });
        setProducts({ data: productsWithImages });
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filter, market]);

  const handleAddToCart = (e: React.MouseEvent, product: ExtendedProduct) => {
    e.stopPropagation();
    e.preventDefault();
    setAddingId(product.id!);
    addToCart(
      product,
    );
    setTimeout(() => setAddingId(null), 1000);
  };

  return (
    <section className="py-24 px-6 md:px-12 bg-background">
      <QuickViewModal 
        product={selectedQuickViewProduct} 
        isOpen={!!selectedQuickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-2">
            <span className="text-amber-gold text-[10px] uppercase font-bold tracking-[0.4em]">USA Authentic</span>
            <h2 className="text-4xl md:text-5xl font-serif text-foreground">{title}</h2>
          </div>
          <button className="text-sm font-bold uppercase tracking-widest text-foreground/40 border-b border-transparent hover:border-amber-gold hover:text-amber-gold transition-all pb-1">
            Browse All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            <div className="col-span-full py-20 text-center text-muted-foreground italic">Loading products from Myanmar Heritage...</div>
          ) : !products || products.data.length === 0 ? (
             <div className="col-span-full py-20 text-center text-muted-foreground italic">No products available at the moment.</div>
          ) : products.data.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              onMouseEnter={() => setHoveredProduct(product.id!)}
              onMouseLeave={() => setHoveredProduct(null)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-neutral-100 shadow-sm">
                <Image
                  src={(hoveredProduct === product.id ? product.secondaryImage : product.image) || ""}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="absolute bottom-4 left-4 right-4 flex space-x-2 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <button 
                    disabled={!product.inStock || addingId === product.id}
                    onClick={(e) => handleAddToCart(e, product)}
                    className={cn(
                      "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center space-x-2",
                      addingId === product.id 
                        ? "bg-amber-gold text-white" 
                        : "bg-background text-foreground hover:bg-amber-gold hover:text-white"
                    )}
                  >
                    {addingId === product.id ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                    <span>{addingId === product.id ? "Added" : "Quick Buy"}</span>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
                    className="w-12 h-12 bg-background text-foreground flex items-center justify-center hover:bg-amber-gold hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <span className="bg-amber-gold backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-none">
                    {product.data?.brand?.name || product.data?.category?.name || "Authentic"}
                  </span>
                </div>

                {product.onSale && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-red-500 text-white text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-none shadow-lg">
                      Sale
                    </span>
                  </div>
                )}

                {!product.inStock && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#1A1A1A]/80 text-white text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-none">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col items-center text-center space-y-1">
                <a href={`/shop/${product.id}`} className="block group-hover:translate-y-[-2px] transition-transform">
                  <h3 className="text-lg font-serif text-foreground group-hover:text-amber-gold transition-colors">
                    {product.name}
                  </h3>
                </a>
                <div className="flex items-center space-x-3">
                  <Price amount={product.price} isUsdPrice={product.isUsdPrice !== false} className="text-sm text-amber-gold font-bold tracking-widest" />
                  {product.onSale && product.compareAtPrice && (
                    <Price amount={product.compareAtPrice} isUsdPrice={product.isUsdPrice !== false} className="text-[10px] text-muted-foreground line-through decoration-red-500/50" />
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
