"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import QuickViewModal from "@/components/modals/QuickViewModal";
import CompareDrawer from "@/components/CompareDrawer";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { ShoppingBag, Eye, Filter, X, ChevronDown, Check, Scale, Percent, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import Price from "@/components/Price";

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
  const formatPrice = useStore((state) => state.formatPrice);
  const currency = useStore((state) => state.currency);
  const exchangeRate = useStore((state) => state.exchangeRate);
  
  const [addingId, setAddingId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedColor, setSelectedColor] = useState("All");
  const [selectedSize, setSelectedSize] = useState("All");
  
  // Price Range in currently selected currency
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]); // Default in USD
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlySale, setOnlySale] = useState(initialSaleFilter);
  const [sortBy, setSortBy] = useState("latest");

  // Sync searchQuery with URL search param
  useEffect(() => {
    const search = searchParams.get('search');
    if (search !== null) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrand, selectedCategory, selectedColor, selectedSize, priceRange, searchQuery, onlyInStock, onlySale, sortBy]);

  // Adjust max price and range when currency changes
  const MAX_PRICE_USD = 10000;
  const maxPrice = currency === 'USD' ? MAX_PRICE_USD : MAX_PRICE_USD * exchangeRate;
  
  useEffect(() => {
    // When currency changes, reset or convert the current price range to match new scale
    setPriceRange([0, maxPrice]);
  }, [currency, exchangeRate, maxPrice]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
        const data = await res.json();
        
        // Map backend data to frontend expected structure
        const mappedProducts = data.map((p: any) => ({
          ...p,
          price: parseFloat(p.price),
          originalPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice) : null,
          isUsdPrice: p.isUsdPrice !== false,
          category: p.category?.name || "Uncategorized",
          brand: p.brand?.name || "Unbranded",
          image: p.images?.[0] || "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
          inStock: p.variants?.some((v: any) => v.stock > 0) ?? true,
          sizes: Array.from(new Set(p.variants?.flatMap((v: any) => v.size ? [v.size] : []) || [])),
          colors: Array.from(new Set(p.variants?.flatMap((v: any) => v.color ? [v.color] : []) || []))
        }));
        
        setProducts(mappedProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const brands = useMemo(() => {
    const uniqueBrands = new Set(products.map(p => p.brand).filter(Boolean));
    return ["All", ...Array.from(uniqueBrands).sort()];
  }, [products]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(products.map(p => p.category).filter(Boolean));
    return ["All", ...Array.from(uniqueCategories).sort()];
  }, [products]);

  const sizes = useMemo(() => {
    const allSizes = products.flatMap(p => p.sizes || []);
    return ["All", ...Array.from(new Set(allSizes)).sort()];
  }, [products]);

  const colors = useMemo(() => {
    const allColors = products.flatMap(p => p.colors || []);
    return ["All", ...Array.from(new Set(allColors)).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const results = [...products].filter((product) => {
      const brandMatch = selectedBrand === "All" || product.brand === selectedBrand;
      const categoryMatch = selectedCategory === "All" || product.category === selectedCategory;
      const colorMatch = selectedColor === "All" || product.colors?.includes(selectedColor);
      const sizeMatch = selectedSize === "All" || product.sizes?.includes(selectedSize);
      
      // Convert product price to current currency for filtering
      let productPriceInCurrentCurrency = product.price;
      if (product.isUsdPrice && currency === 'MMK') {
        productPriceInCurrentCurrency = product.price * exchangeRate;
      } else if (!product.isUsdPrice && currency === 'USD') {
        productPriceInCurrentCurrency = product.price / exchangeRate;
      }
      
      const priceMatch = productPriceInCurrentCurrency >= priceRange[0] && productPriceInCurrentCurrency <= priceRange[1];
      const stockMatch = !onlyInStock || product.inStock;
      const saleMatch = !onlySale || product.onSale;
      
      const searchMatch = searchQuery === "" || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      return brandMatch && categoryMatch && colorMatch && sizeMatch && priceMatch && stockMatch && saleMatch && searchMatch;
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
  }, [products, selectedBrand, selectedCategory, selectedColor, selectedSize, priceRange, onlyInStock, onlySale, sortBy, searchQuery, currency, exchangeRate]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);


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
                {/* Double Range Slider UI */}
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
                    }}
                    className="absolute w-full -top-1 h-2 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#D4AF37] [&::-webkit-slider-thumb]:appearance-none accent-[#D4AF37]"
                  />
                </div>
                
                {/* Manual Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Min ({currency})</span>
                    <input 
                      type="number"
                      value={Math.round(priceRange[0])}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-full bg-[#1A1A1A]/5 border-none px-3 py-2 text-[10px] font-bold outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Max ({currency})</span>
                    <input 
                      type="number"
                      value={Math.round(priceRange[1])}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
                      className="w-full bg-[#1A1A1A]/5 border-none px-3 py-2 text-[10px] font-bold outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40 pt-2">
                  <span>{formatPrice(priceRange[0], currency === 'USD')}</span>
                  <span className="text-[#D4AF37]">{formatPrice(priceRange[1], currency === 'USD')}</span>
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
              onClick={() => {
                setSelectedBrand("All");
                setSelectedCategory("All");
                setSelectedColor("All");
                setSelectedSize("All");
                setPriceRange([0, maxPrice]);
                setOnlyInStock(false);
                setOnlySale(false);
                setSearchQuery("");
              }}
              className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-600 transition-colors pt-4 block"
            >
              Clear All Filters
            </button>
            </aside>

            {/* Product Grid Area */}
            <div className="flex-1 space-y-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#1A1A1A]/5">
                {/* Search Bar - Aesthetic from image */}
                <div className="relative flex-1 max-w-md group flex items-center">
                  <Search className="w-5 h-5 text-[#1A1A1A]/20 group-focus-within:text-[#D4AF37] transition-colors" />
                  <div className="h-6 w-[1px] bg-[#1A1A1A]/10 mx-4" /> {/* Vertical separator from image inspiration */}
                  <input 
                    type="text"
                    placeholder="Search brands or items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none py-2 text-xs font-medium placeholder:text-[#1A1A1A]/20 outline-none transition-all"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="ml-2"
                    >
                      <X className="w-4 h-4 text-[#1A1A1A]/40 hover:text-[#1A1A1A]" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between md:justify-end gap-8">
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
              </div>

              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Syncing Master Catalog...</span>
                </div>
              ) : (
                <div className="space-y-20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                    <AnimatePresence mode="popLayout">
                      {paginatedProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.4 }}
                          className="group"
                        >
                          <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-neutral-100">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-1000 group-hover:scale-105"
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
                              <Price amount={product.price} isUsdPrice={product.isUsdPrice} className="text-sm text-[#D4AF37] font-bold" />
                              {product.onSale && product.originalPrice && (
                                <Price amount={product.originalPrice} isUsdPrice={product.isUsdPrice} className="text-[10px] text-[#1A1A1A]/30 font-bold line-through" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 pt-12 border-t border-[#1A1A1A]/5">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => {
                          setCurrentPage(currentPage - 1);
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                        className="px-6 py-3 border border-[#1A1A1A]/10 text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
                      >
                        Previous
                      </button>

                      <div className="flex items-center px-8 space-x-6">
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setCurrentPage(i + 1);
                              window.scrollTo({ top: 400, behavior: 'smooth' });
                            }}
                            className={cn(
                              "text-[10px] font-bold tracking-widest transition-all",
                              currentPage === i + 1 ? "text-[#D4AF37]" : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
                            )}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => {
                          setCurrentPage(currentPage + 1);
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                        className="px-6 py-3 border border-[#1A1A1A]/10 text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
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
