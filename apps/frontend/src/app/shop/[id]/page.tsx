"use client";

import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import Image from "next/image";
import { ShoppingBag, Heart, Star, ShieldCheck, Truck, ArrowLeft, Share2, Scale, Ruler, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";
import ProductGrid from "@/components/ProductGrid";
import SizeGuideModal from "@/components/modals/SizeGuideModal";
import ProductReviews from "@/components/ProductReviews";
import { useStore } from "@/store/useStore";
import DOMPurify from 'dompurify';
import Price from "@/components/Price";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("description");
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [sanitizedDescription, setSanitizedDescription] = useState("");

  const addToCart = useStore((state) => state.addToCart);
  const addToCompare = useStore((state) => state.addToCompare);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        
        const mappedProduct = {
          ...data,
          price: parseFloat(data.price),
          originalPrice: data.compareAtPrice ? parseFloat(data.compareAtPrice) : null,
          isUsdPrice: data.isUsdPrice !== false,
          category: data.category?.name || "Uncategorized",
          image: data.images?.[0] || "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
          inStock: data.variants?.some((v: any) => v.stock > 0) ?? true,
          isPreOrder: data.isPreOrder,
          preOrderShippingDate: data.preOrderShippingDate,
          preOrderNote: data.preOrderNote,
          sizes: Array.from(new Set(data.variants?.map((v: any) => v.size) || [])),
          colors: Array.from(new Set(data.variants?.map((v: any) => v.color) || [])),
          details: data.detail ? data.detail.split('\n').filter((l: string) => l.trim()) : ["Imported from USA", "100% Authentic Guarantee", "Premium materials", "Original brand packaging"]
        };
        
        setProduct(mappedProduct);
        if (typeof window !== 'undefined') {
          const defaultDesc = "Indulge in the elegance of authentic global fashion. Each piece is sourced directly from USA outlets to guarantee quality and authenticity.";
          setSanitizedDescription(DOMPurify.sanitize(data.description || defaultDesc));
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes?.length > 0) {
      alert("Please select a size");
      return;
    }
    setAddingId(product.id);
    
    // Find the actual variant ID based on selected size
    const selectedVariant = product.variants?.find((v: any) => v.size === selectedSize);
    
    addToCart(product, selectedSize || undefined, selectedVariant?.id, product.isPreOrder, product.preOrderShippingDate);
    setTimeout(() => setAddingId(null), 1000);
  };

  if (loading) {
    return (
      <main className="relative min-h-screen bg-[#FDFDFD]">
        <Navbar />
        <div className="pt-48 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#D4AF37]" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Fetching Product Details...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="relative min-h-screen bg-[#FDFDFD]">
        <Navbar />
        <div className="pt-48 flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <h1 className="text-4xl font-serif text-[#1A1A1A]">Product Not Found</h1>
          <button 
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#FDFDFD]">
      <Navbar />

      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />

      <section className="pt-48 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Back Link */}
        <button 
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shop</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left: Product Images */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-[4/5] bg-[#F5F0E1] overflow-hidden rounded-sm"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {product.onSale && (
                <div className="absolute top-8 right-8 bg-red-500 text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] shadow-xl rounded-full">
                  -{Math.round((1 - product.price / (product.originalPrice || product.price)) * 100)}% Off
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[#D4AF37] text-[10px] uppercase font-bold tracking-[0.4em] mb-2 block">
                      {product.category}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-serif text-[#1A1A1A]">{product.name}</h1>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => addToCompare(product)}
                      className="p-3 border border-[#1A1A1A]/5 rounded-full hover:bg-white hover:shadow-md transition-all text-[#1A1A1A]/40 hover:text-[#D4AF37]"
                    >
                      <Scale className="w-5 h-5" />
                    </button>
                    <button className="p-3 border border-[#1A1A1A]/5 rounded-full hover:bg-white hover:shadow-md transition-all text-[#1A1A1A]/40 hover:text-[#D4AF37]">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <Price amount={product.price} isUsdPrice={product.isUsdPrice} className="text-3xl text-[#D4AF37] font-bold" />
                  {product.onSale && product.originalPrice && (
                    <Price amount={product.originalPrice} isUsdPrice={product.isUsdPrice} className="text-lg text-[#1A1A1A]/30 font-bold line-through" />
                  )}
                  <div className="w-px h-4 bg-[#1A1A1A]/10" />
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                      ))}
                    </div>
                    <span className="text-[10px] text-[#1A1A1A]/40 font-bold tracking-widest uppercase">
                      {product.reviews?.length > 0 
                        ? `${(product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / product.reviews.length).toFixed(1)} (${product.reviews.length})` 
                        : "No reviews yet"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="flex border-b border-[#1A1A1A]/5">
                    {["description", "details", "shipping"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "pb-4 px-6 text-[10px] font-bold uppercase tracking-widest transition-all relative",
                          activeTab === tab ? "text-[#1A1A1A]" : "text-[#1A1A1A]/30 hover:text-[#1A1A1A]/60"
                        )}
                      >
                        {tab}
                        {activeTab === tab && (
                          <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />
                        )}
                      </button>
                    ))}
                 </div>
                 
                 <div className="min-h-[100px] py-4 text-sm text-[#1A1A1A]/60 leading-relaxed font-sans prose">
                    {activeTab === "description" && (
                      <div dangerouslySetInnerHTML={{ __html: sanitizedDescription || "Indulge in the elegance of authentic global fashion. Each piece is sourced directly from USA outlets to guarantee quality and authenticity." }} />
                    )}
                    {activeTab === "details" && (
                      <ul className="space-y-2">
                        {product.details.map((item: string, i: number) => (
                          <li key={i} className="flex items-center space-x-3">
                            <div className="w-1 h-1 bg-[#D4AF37] rounded-full" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {activeTab === "shipping" && (
                      <p>Standard delivery within Yangon takes 1-2 business days. Regional delivery takes 3-5 business days. Express options available at checkout.</p>
                    )}
                 </div>
              </div>

              {/* Color & Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Available Colors</h4>
                   <div className="flex flex-wrap gap-3">
                      {product.colors?.map((color: string) => (
                        <div key={color} className="flex items-center space-x-2 border border-[#1A1A1A]/5 px-3 py-2 rounded-sm bg-white">
                           <div className="w-3 h-3 rounded-full bg-[#D4AF37]" />
                           <span className="text-[10px] font-medium text-[#1A1A1A]/60 uppercase tracking-widest">{color}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">USA Size</h4>
                    <button 
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="flex items-center space-x-2 text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest border-b border-transparent hover:border-[#D4AF37] transition-all"
                    >
                      <Ruler className="w-3 h-3" />
                      <span>Size Guide</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes?.map((size: string) => (
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
              </div>

              {/* Add to Bag */}
              <div className="pt-8 space-y-4">
                {product.isPreOrder && (
                  <div className="bg-[#D4AF37]/10 p-4 border border-[#D4AF37]/20 rounded-sm">
                    <h5 className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" /> Pre-Order Item
                    </h5>
                    {product.preOrderShippingDate && (
                      <p className="text-xs text-[#1A1A1A]/60 mt-2">
                        Expected Shipping: <span className="font-bold text-[#1A1A1A]">{new Date(product.preOrderShippingDate).toLocaleDateString()}</span>
                      </p>
                    )}
                    {product.preOrderNote && (
                      <p className="text-xs text-[#1A1A1A]/60 mt-1 italic">
                        "{product.preOrderNote}"
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    disabled={(!product.inStock && !product.isPreOrder) || addingId === product.id}
                    onClick={handleAddToCart}
                    className={cn(
                      "flex-1 py-5 uppercase tracking-[0.2em] text-xs font-bold transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center space-x-4 shadow-xl disabled:opacity-50",
                      addingId === product.id ? "bg-[#D4AF37] text-white" : "bg-[#1A1A1A] text-white hover:bg-[#D4AF37]"
                    )}
                  >
                    {addingId === product.id ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                    <span>
                      {addingId === product.id 
                        ? "Added to Bag" 
                        : product.isPreOrder 
                          ? "Pre-Order Now" 
                          : (!product.inStock ? "Out of Stock" : "Add to Shopping Bag")}
                    </span>
                  </button>
                  <button className="w-16 h-16 border border-[#1A1A1A]/10 flex items-center justify-center text-[#1A1A1A]/40 hover:text-red-500 hover:border-red-500 transition-all group">
                    <Heart className="w-6 h-6 group-hover:fill-red-500" />
                  </button>
                </div>
              </div>

              {/* Footer Info */}
              <div className="pt-12 grid grid-cols-2 gap-8 border-t border-[#1A1A1A]/5">
                 <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#F5F0E1] flex items-center justify-center rounded-full">
                       <Truck className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                       <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Fast Delivery</h5>
                       <p className="text-[10px] text-[#1A1A1A]/40">Within 48 hours in Yangon</p>
                    </div>
                 </div>
                 <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#F5F0E1] flex items-center justify-center rounded-full">
                       <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                       <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Legitimacy</h5>
                       <p className="text-[10px] text-[#1A1A1A]/40">100% Authentic Brands</p>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <ProductReviews reviews={product.reviews || []} />

      {/* Recommended Products */}
      <ProductGrid title="You May Also Love" />
    </main>
  );
}
