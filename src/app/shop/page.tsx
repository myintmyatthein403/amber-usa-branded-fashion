"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import QuickViewModal from "@/components/modals/QuickViewModal";
import CompareDrawer from "@/components/CompareDrawer";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { ShoppingBag, Eye, Filter, X, ChevronDown, Check, Scale, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
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
  },
  {
    id: 5,
    name: "Nike Tech Fleece Joggers",
    price: 110000,
    originalPrice: 165000,
    category: "Nike",
    color: "Black",
    sizes: ["S", "M", "L"],
    inStock: true,
    onSale: true,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 6,
    name: "Coach Willow Shoulder Bag",
    price: 420000,
    originalPrice: 580000,
    category: "Coach",
    color: "Black",
    sizes: ["One Size"],
    inStock: true,
    onSale: true,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
  },
];

const CATEGORIES = ["All", "Nike", "Coach", "Adidas", "Ralph Lauren"];
const COLORS = ["All", "Black", "White", "Grey", "Tan", "Blue"];
const SIZES = ["All", "XS", "S", "M", "L", "XL", "One Size"];
const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A-Z", value: "name_asc" },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const initialSaleFilter = searchParams.get('sale') === 'true';

  const addToCart = useStore((state) => state.addToCart);
  const addToCompare = useStore((state) => state.addToCompare);
  const compareList = useStore((state) => state.compareList);
  const selectedQuickViewProduct = useStore((state) => state.selectedQuickViewProduct);
  const setQuickViewProduct = useStore((state) => state.setQuickViewProduct);
  
  const [addingId, setAddingId] = useState<number | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedColor, setSelectedColor] = useState("All");
  const [selectedSize, setSelectedSize] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 600000]);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlySale, setOnlySale] = useState(initialSaleFilter);
  const [sortBy, setSortBy] = useState("latest");
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let results = [...SHOP_PRODUCTS].filter((product) => {
      const categoryMatch = selectedCategory === "All" || product.category === selectedCategory;
      const colorMatch = selectedColor === "All" || product.color === selectedColor;
      const sizeMatch = selectedSize === "All" || product.sizes.includes(selectedSize);
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
      const stockMatch = !onlyInStock || product.inStock;
      const saleMatch = !onlySale || product.onSale;
      
      return categoryMatch && colorMatch && sizeMatch && priceMatch && stockMatch && saleMatch;
    });

    switch (sortBy) {
      case "price_asc":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        results.sort((a, b) => b.price - a.price);
        break;
      case "name_asc":
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return results;
  }, [selectedCategory, selectedColor, selectedSize, priceRange, onlyInStock, onlySale, sortBy]);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    e.preventDefault();
    setAddingId(product.id);
    addToCart(product);
    setTimeout(() => setAddingId(null), 800);
  };

  return (
    <>
      <QuickViewModal 
        product={selectedQuickViewProduct} 
        isOpen={!!selectedQuickViewProduct} 
        onClose={() => setQuickViewProduct(null)}
      />

      <CompareDrawer />

      {/* Hero Section for Shop */}
      <section className="pt-48 pb-20 bg-[#F5F0E1]/50 text-center relative overflow-hidden">
        <div className="absolute inset-0 acheik-pattern opacity-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 space-y-4"
        >
          <span className="text-[#D4AF37] text-[10px] uppercase font-bold tracking-[0.4em]">USA Collections</span>
          <h1 className="text-5xl md:text-7xl font-serif text-[#1A1A1A]">
            {onlySale ? "Thingyan Mega Sale" : "The Brand Shop"}
          </h1>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="hidden md:block w-72 space-y-12 shrink-0 border-r border-[#1A1A1A]/5 pr-12">
            
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

            {/* Categories */}
            <div className="space-y-6">
              <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1A1A]">Brands</h4>
              <div className="flex flex-col space-y-4">
                {CATEGORIES.map((cat) => (
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
              <div className="space-y-4">
                <input 
                  type="range" 
                  min="0" 
                  max="600000" 
                  step="10000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">
                  <span>0 MMK</span>
                  <span className="text-[#D4AF37]">{priceRange[1].toLocaleString()} MMK</span>
                </div>
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-6">
              <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1A1A]">USA Size</h4>
              <div className="grid grid-cols-3 gap-2">
                {SIZES.map((size) => (
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
              onClick={() => {
                setSelectedCategory("All");
                setSelectedColor("All");
                setSelectedSize("All");
                setPriceRange([0, 600000]);
                setOnlyInStock(false);
                setOnlySale(false);
              }}
              className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-600 transition-colors pt-4 block"
            >
              Clear All Filters
            </button>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1 space-y-8">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#1A1A1A]/40 font-medium tracking-widest uppercase text-[10px] font-bold">
                {filteredProducts.length} Items Found
              </span>
              
              <div className="relative">
                <button 
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]"
                >
                  <span className="text-[#1A1A1A]/40 font-medium">Sort by:</span>
                  <span>{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", isSortDropdownOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {isSortDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-4 w-56 bg-white border border-[#1A1A1A]/5 shadow-xl z-20 py-2"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setIsSortDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors",
                            sortBy === option.value ? "text-[#D4AF37] bg-[#F5F0E1]/30" : "text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-zinc-50"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    className="group"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#F5F0E1]">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className={cn(
                          "object-cover transition-transform duration-1000 group-hover:scale-105",
                          !product.inStock && "opacity-50 grayscale"
                        )}
                      />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {product.onSale && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg z-10">
                          -{Math.round((1 - product.price / (product.originalPrice || product.price)) * 100)}%
                        </div>
                      )}

                      <div className="absolute bottom-4 left-4 right-4 flex space-x-2 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <button 
                          disabled={!product.inStock || addingId === product.id}
                          onClick={(e) => handleAddToCart(e, product)}
                          className={cn(
                            "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center space-x-2",
                            addingId === product.id ? "bg-[#D4AF37] text-white" : "bg-white text-[#1A1A1A] hover:bg-[#D4AF37] hover:text-white"
                          )}
                        >
                          {addingId === product.id ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                          <span>{addingId === product.id ? "Added" : "Add to Bag"}</span>
                        </button>
                        <button 
                          onClick={() => setQuickViewProduct(product)}
                          className="w-12 h-12 bg-white text-[#1A1A1A] flex items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => addToCompare(product)}
                          className={cn(
                            "w-12 h-12 flex items-center justify-center transition-colors",
                            compareList.find(p => p.id === product.id) ? "bg-[#D4AF37] text-white" : "bg-white text-[#1A1A1A] hover:bg-[#D4AF37] hover:text-white"
                          )}
                        >
                          <Scale className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="absolute top-4 left-4 flex items-center space-x-2">
                        <span className="bg-[#1A1A1A]/80 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm">
                          {product.category}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-1 text-center">
                      <a href={`/shop/${product.id}`}>
                        <h3 className="text-lg font-serif text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors">
                          {product.name}
                        </h3>
                      </a>
                      <div className="flex items-center justify-center space-x-3">
                        <p className="text-sm text-[#D4AF37] font-bold">
                          {product.price.toLocaleString()} MMK
                        </p>
                        {product.onSale && product.originalPrice && (
                          <p className="text-[10px] text-[#1A1A1A]/30 font-bold line-through">
                            {product.originalPrice.toLocaleString()} MMK
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function ShopPage() {
  return (
    <main className="relative min-h-screen bg-[#FDFDFD]">
      <Navbar />
      <Suspense fallback={
        <div className="pt-48 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
        </div>
      }>
        <ShopContent />
      </Suspense>
    </main>
  );
}
