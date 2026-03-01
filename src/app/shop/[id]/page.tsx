"use client";

import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { motion } from "motion/react";
import Image from "next/image";
import { ShoppingBag, Heart, Star, ShieldCheck, Truck, ArrowLeft, Share2, Facebook, Instagram, Ruler, Check, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import ProductGrid from "@/components/ProductGrid";
import SizeGuideModal from "@/components/modals/SizeGuideModal";
import ProductReviews from "@/components/ProductReviews";
import { useStore } from "@/store/useStore";

const SHOP_PRODUCTS = [
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
    description: "The quintessential Coach tote, crafted in our signature canvas with refined leather details. Spaciously sized to hold all your essentials, this bag blends classic USA heritage with modern functionality.",
    details: ["Signature coated canvas and refined pebble leather", "Inside zip, cell phone and multifunction pockets", "Zip-top closure, fabric lining", "Handles with 10 1/4\" drop"]
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
    description: "Nike's first lifestyle Air Max brings you style, comfort and a big attitude in the Nike Air Max 270. The design draws inspiration from Air Max icons, showcasing Nike's greatest innovation with its large window and fresh array of colors.",
    details: ["Max Air 270 unit delivers unrivaled, all-day comfort", "Woven and synthetic fabric on the upper provides a lightweight fit and airy feel", "Foam midsole feels soft and comfortable", "Stretchy inner sleeve and booty-like construction creates a personalized fit"]
  },
  {
    id: 3,
    name: "Adidas Essentials Hoodie",
    price: 85000,
    category: "Adidas",
    color: "Grey Heather",
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    onSale: false,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",
    description: "Slide into comfort with this Adidas essentials hoodie. Made with soft fleece, it features the iconic logo and a relaxed fit perfect for everyday wear.",
    details: ["Regular fit", "Drawcord on hood", "53% cotton, 36% recycled polyester, 11% viscose fleece", "Kangaroo pocket"]
  },
  {
    id: 4,
    name: "Ralph Lauren Polo Shirt",
    price: 125000,
    category: "Ralph Lauren",
    color: "Royal Blue",
    sizes: ["M", "L"],
    inStock: false,
    onSale: false,
    image: "https://images.unsplash.com/photo-1586363104864-50e2187ced2f?auto=format&fit=crop&q=80&w=800",
    description: "An American style standard since 1972, the Polo shirt has been imitated but never matched. Over the decades, Ralph Lauren has reimagined his signature style in a wide array of colors and fits, but all retain the quality and attention to detail of the iconic original.",
    details: ["Classic Fit: our roomiest silhouette", "Ribbed Polo collar. Two-button placket", "Short sleeves with ribbed armbands", "Signature embroidered Pony at the left chest"]
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const product = useMemo(() => SHOP_PRODUCTS.find((p) => p.id === id) || SHOP_PRODUCTS[0], [id]);
  
  const addToCart = useStore((state) => state.addToCart);
  const addToCompare = useStore((state) => state.addToCompare);
  const [addingId, setAddingId] = useState<number | null>(null);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("description");
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes?.length > 0) {
      alert("Please select a size");
      return;
    }
    setAddingId(product.id);
    addToCart(product, selectedSize || undefined);
    setTimeout(() => setAddingId(null), 1000);
  };

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
                  <p className="text-3xl text-[#D4AF37] font-bold">{product.price.toLocaleString()} MMK</p>
                  {product.onSale && product.originalPrice && (
                    <p className="text-lg text-[#1A1A1A]/30 font-bold line-through">
                      {product.originalPrice.toLocaleString()} MMK
                    </p>
                  )}
                  <div className="w-px h-4 bg-[#1A1A1A]/10" />
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                      ))}
                    </div>
                    <span className="text-[10px] text-[#1A1A1A]/40 font-bold tracking-widest uppercase">4.8 (124)</span>
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
                 
                 <div className="min-h-[100px] py-4 text-sm text-[#1A1A1A]/60 leading-relaxed font-sans">
                    {activeTab === "description" && (
                      <p>{product.description || "Indulge in the elegance of authentic global fashion. Each piece is sourced directly from USA outlets to guarantee quality and authenticity."}</p>
                    )}
                    {activeTab === "details" && (
                      <ul className="space-y-2">
                        {(product.details || ["Imported from USA", "100% Authentic Guarantee", "Premium materials", "Original brand packaging"]).map((item, i) => (
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
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Color</h4>
                   <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full border border-[#D4AF37] p-0.5">
                         <div className="w-full h-full rounded-full bg-[#D4AF37]" />
                      </div>
                      <span className="text-xs font-medium text-[#1A1A1A]/60 italic">{product.color}</span>
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Size</h4>
                    <button 
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="flex items-center space-x-2 text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest border-b border-transparent hover:border-[#D4AF37] transition-all"
                    >
                      <Ruler className="w-3 h-3" />
                      <span>Size Guide</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes?.map((size) => (
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
                <div className="flex gap-4">
                  <button
                    disabled={!product.inStock || addingId === product.id}
                    onClick={handleAddToCart}
                    className={cn(
                      "flex-1 py-5 uppercase tracking-[0.2em] text-xs font-bold transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center space-x-4 shadow-xl disabled:opacity-50",
                      addingId === product.id ? "bg-[#D4AF37] text-white" : "bg-[#1A1A1A] text-white hover:bg-[#D4AF37]"
                    )}
                  >
                    {addingId === product.id ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                    <span>{addingId === product.id ? "Added to Bag" : "Add to Shopping Bag"}</span>
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
      <ProductReviews />

      {/* Recommended Products */}
      <ProductGrid title="You May Also Love" />

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-16 px-6 text-center border-t border-white/5">
         <div className="flex flex-col items-center space-y-4">
            <h2 className="text-2xl font-serif tracking-tighter uppercase text-white">Amber</h2>
            <p className="text-[10px] uppercase tracking-widest text-white/20">© 2026 Amber Premium. Authentic USA Brands.</p>
         </div>
      </footer>
    </main>
  );
}
