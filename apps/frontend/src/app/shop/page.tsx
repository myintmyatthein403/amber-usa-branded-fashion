"use client";

import { useState, useMemo, Suspense, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import QuickViewModal from "@/components/modals/QuickViewModal";
import CompareDrawer from "@/components/CompareDrawer";
import ShopSidebar from "@/components/ShopSidebar";
import { useDebounce } from "@/hooks/useDebounce";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { ShoppingBag, Eye, Filter, X, ChevronDown, Check, Scale, Percent, Loader2, Search, LayoutGrid, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import Price from "@/components/Price";
import {
  Product,
  buildCategoryTree,
  getCategoryScopeIds,
  type CategoryNode,
  type CategoryTreeNode,
} from "@amber/shared";

interface ShopProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  isUsdPrice: boolean;
  category: string;
  categoryId?: string | null;
  brand: string;
  collections: string[];
  image: string;
  inStock: boolean;
  sizes: string[];
  colors: string[];
  onSale?: boolean;
}

const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A-Z", value: "name_asc" },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const initialSaleFilter = searchParams.get('sale') === 'true';
  const initialCollectionFilter = searchParams.get('collection') || "All";

  const addToCart = useStore((state) => state.addToCart);
  const addToCompare = useStore((state) => state.addToCompare);
  const compareList = useStore((state) => state.compareList);
  const selectedQuickViewProduct = useStore((state) => state.selectedQuickViewProduct);
  const setQuickViewProduct = useStore((state) => state.setQuickViewProduct);
  const formatPrice = useStore((state) => state.formatPrice);
  const currency = useStore((state) => state.currency);
  const exchangeRate = useStore((state) => state.exchangeRate);
  
  const [addingId, setAddingId] = useState<string | null>(null);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [shopCategories, setShopCategories] = useState<CategoryNode[]>([]);
  const [selectedCollection, setSelectedCollection] = useState(initialCollectionFilter);
  const [selectedColor, setSelectedColor] = useState("All");
  const [selectedSize, setSelectedSize] = useState("All");
  
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
  const [minPriceInput, setMinPriceInput] = useState("0");
  const [maxPriceInput, setMaxPriceInput] = useState("10000"); 
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlySale, setOnlySale] = useState(initialSaleFilter);
  const [sortBy, setSortBy] = useState("latest");

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedPriceRange = useDebounce(priceRange, 500);
  
  const isDebouncing = searchQuery !== debouncedSearchQuery || 
    priceRange[0] !== debouncedPriceRange[0] || 
    priceRange[1] !== debouncedPriceRange[1];
    
  useEffect(() => {
    if (isDebouncing) {
      setFilterLoading(true);
    } else {
      const timer = setTimeout(() => setFilterLoading(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isDebouncing]);

  useEffect(() => {
    const search = searchParams.get('search');
    if (search !== null) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrand, selectedCategoryId, selectedCollection, selectedColor, selectedSize, priceRange, searchQuery, onlyInStock, onlySale, sortBy]);

  const MAX_PRICE_USD = 3000;
  const maxPrice = currency === 'USD' ? MAX_PRICE_USD : MAX_PRICE_USD * exchangeRate;
  
  useEffect(() => {
    setPriceRange([0, maxPrice]);
    setMinPriceInput("0");
    setMaxPriceInput(maxPrice.toLocaleString());
  }, [currency, exchangeRate, maxPrice]);

  const formatNumber = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned) return '';
    return parseInt(cleaned, 10).toLocaleString();
  };

  const parseFormattedNumber = (value: string) => {
    return parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
  };

  const handleMinPriceChange = (value: string) => {
    const formatted = formatNumber(value);
    setMinPriceInput(formatted);
    const numValue = parseFormattedNumber(formatted);
    setPriceRange([Math.min(numValue, priceRange[1] - 1), priceRange[1]]);
  };

  const handleMaxPriceChange = (value: string) => {
    const formatted = formatNumber(value);
    setMaxPriceInput(formatted);
    const numValue = parseFormattedNumber(formatted);
    setPriceRange([priceRange[0], Math.max(numValue, priceRange[0] + 1)]);
  };

  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
    try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
    const result = await res.json();
    const data = result?.data || result || [];

    const mappedProducts = data.map((p: { collections?: { name: string }[]; variants?: { stock: number; size?: string; color?: string }[]; category?: { id: string; name: string }; brand?: { name: string }; images?: string[] } & Record<string, unknown>) => ({
      ...p,
      price: parseFloat(String(p.price)),
      originalPrice: p.compareAtPrice ? parseFloat(String(p.compareAtPrice)) : null,
      isUsdPrice: p.isUsdPrice !== false,
      category: p.category?.name || "Uncategorized",
      categoryId: p.category?.id ?? null,
      brand: p.brand?.name || "Unbranded",
      collections: p.collections?.map((c) => c.name) || [],
      image: p.images?.[0] || "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
      inStock: p.variants?.some((v) => v.stock > 0) ?? true,
      sizes: Array.from(new Set(p.variants?.flatMap((v) => v.size ? [v.size] : []) || [])),
      colors: Array.from(new Set(p.variants?.flatMap((v) => v.color ? [v.color] : []) || []))
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories?limit=100`);
        const result = await res.json();
        const data = (result?.data ?? result ?? []) as CategoryNode[];
        setShopCategories(
          data.filter((c) => c.isActive !== false),
        );
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setShopCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const categoryTree = useMemo<CategoryTreeNode[]>(
    () => buildCategoryTree(shopCategories),
    [shopCategories],
  );

  const categoryScopeIds = useMemo(() => {
    if (!selectedCategoryId || shopCategories.length === 0) return null;
    return new Set(getCategoryScopeIds(shopCategories, selectedCategoryId));
  }, [selectedCategoryId, shopCategories]);

  const brands = useMemo(() => {
    const uniqueBrands = new Set(products.map(p => p.brand).filter(Boolean));
    return ["All", ...Array.from(uniqueBrands).sort()];
  }, [products]);

  const collections = useMemo(() => {
    const uniqueCollections = new Set(products.flatMap(p => p.collections || []));
    return ["All", ...Array.from(uniqueCollections).sort()];
  }, [products]);

  const sizes = useMemo(() => {
    const allSizes = products.flatMap(p => p.sizes || []);
    return ["All", ...Array.from(new Set(allSizes)).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const results = [...products].filter((product) => {
      const brandMatch = selectedBrand === "All" || product.brand === selectedBrand;
      const categoryMatch =
        selectedCategoryId === null ||
        (categoryScopeIds
          ? Boolean(product.categoryId && categoryScopeIds.has(product.categoryId))
          : product.category === selectedCategoryId);
      const collectionMatch = selectedCollection === "All" || product.collections?.includes(selectedCollection);
      const sizeMatch = selectedSize === "All" || product.sizes?.includes(selectedSize);
      
      let productPriceInCurrentCurrency = product.price;
      if (product.isUsdPrice && currency === 'MMK') {
        productPriceInCurrentCurrency = product.price * exchangeRate;
      } else if (!product.isUsdPrice && currency === 'USD') {
        productPriceInCurrentCurrency = product.price / exchangeRate;
      }
      
      const priceMatch = productPriceInCurrentCurrency >= debouncedPriceRange[0] && productPriceInCurrentCurrency <= debouncedPriceRange[1];
      const stockMatch = !onlyInStock || product.inStock;
      const saleMatch = !onlySale || product.onSale;
      
      const searchMatch = debouncedSearchQuery === "" || 
        product.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      
      return brandMatch && categoryMatch && collectionMatch && sizeMatch && priceMatch && stockMatch && saleMatch && searchMatch;
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
  }, [products, selectedBrand, selectedCategoryId, categoryScopeIds, selectedCollection, selectedSize, debouncedPriceRange, onlyInStock, onlySale, sortBy, debouncedSearchQuery, currency, exchangeRate]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);


  const handleAddToCart = (e: React.MouseEvent, product: ShopProduct) => {
    e.stopPropagation();
    e.preventDefault();
    setAddingId(product.id);
    addToCart(product as unknown as Product);
    setTimeout(() => setAddingId(null), 800);
  };

  const handleClearFilters = useCallback(() => {
    setSelectedBrand("All");
    setSelectedCategoryId(null);
    setSelectedCollection("All");
    setSelectedColor("All");
    setSelectedSize("All");
    setPriceRange([0, maxPrice]);
    setOnlyInStock(false);
    setOnlySale(false);
    setSearchQuery("");
    setMinPriceInput("0");
    setMaxPriceInput(maxPrice.toLocaleString());
  }, [maxPrice, setSelectedBrand, setSelectedCategoryId, setSelectedCollection, setSelectedSize, setPriceRange, setOnlyInStock, setOnlySale, setSearchQuery]);

  const handleResetFilters = useCallback(() => {
    setSelectedBrand("All");
    setSelectedCategoryId(null);
    setSelectedCollection("All");
    setSelectedColor("All");
    setSelectedSize("All");
    setPriceRange([0, maxPrice]);
    setOnlyInStock(false);
    setOnlySale(false);
    setSearchQuery("");
  }, [maxPrice, setSelectedBrand, setSelectedCategoryId, setSelectedCollection, setSelectedSize, setPriceRange, setOnlyInStock, setOnlySale, setSearchQuery]);

  return (
    <>
      <QuickViewModal 
        product={selectedQuickViewProduct} 
        isOpen={!!selectedQuickViewProduct} 
        onClose={() => setQuickViewProduct(null)}
      />

      <CompareDrawer />

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] md:hidden"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white z-[101] md:hidden overflow-y-auto p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-xl font-serif">Filters</h3>
                <button onClick={() => setIsFilterDrawerOpen(false)} className="p-2 border border-[#1A1A1A]/5">
                  <X className="w-5 h-5" />
                </button>
              </div>
<ShopSidebar
                selectedBrand={selectedBrand}
                setSelectedBrand={setSelectedBrand}
                selectedCategoryId={selectedCategoryId}
                setSelectedCategoryId={setSelectedCategoryId}
                categoryTree={categoryTree}
                selectedCollection={selectedCollection}
                setSelectedCollection={setSelectedCollection}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                onlyInStock={onlyInStock}
                setOnlyInStock={setOnlyInStock}
                onlySale={onlySale}
                setOnlySale={setOnlySale}
                products={products}
                currency={currency}
                exchangeRate={exchangeRate}
                minPriceInput={minPriceInput}
                maxPriceInput={maxPriceInput}
                setMinPriceInput={setMinPriceInput}
                setMaxPriceInput={setMaxPriceInput}
              />
              <button 
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-full bg-[#1A1A1A] text-white py-4 uppercase tracking-[0.3em] text-[10px] font-bold mt-12 mb-8"
              >
                Show {filteredProducts.length} Items
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
            {onlySale ? "Thingyan Mega Sale" : selectedCollection !== "All" ? selectedCollection : "The Brand Shop"}
          </h1>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden md:block w-72 shrink-0 border-r border-[#1A1A1A]/5 pr-12">
            <ShopSidebar
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              selectedCategoryId={selectedCategoryId}
              setSelectedCategoryId={setSelectedCategoryId}
              categoryTree={categoryTree}
              selectedCollection={selectedCollection}
              setSelectedCollection={setSelectedCollection}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              onlyInStock={onlyInStock}
              setOnlyInStock={setOnlyInStock}
              onlySale={onlySale}
              setOnlySale={setOnlySale}
              products={products}
              currency={currency}
              exchangeRate={exchangeRate}
              minPriceInput={minPriceInput}
              maxPriceInput={maxPriceInput}
              setMinPriceInput={setMinPriceInput}
              setMaxPriceInput={setMaxPriceInput}
            />
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1 space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#1A1A1A]/5">
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                {/* Mobile Filter Trigger */}
                <button 
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="flex md:hidden items-center justify-center p-3 border border-[#1A1A1A]/10 bg-white shadow-sm"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-md group flex items-center bg-white md:bg-transparent border border-[#1A1A1A]/10 md:border-none p-2 md:p-0">
                  <Search className="w-5 h-5 text-[#1A1A1A]/20 group-focus-within:text-[#D4AF37] transition-colors" />
                  <div className="hidden md:block h-6 w-[1px] bg-[#1A1A1A]/10 mx-4" />
                  <input 
                    type="text"
                    placeholder="Search brands or items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none py-1 text-xs font-medium placeholder:text-[#1A1A1A]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-8">
                <span className="hidden sm:inline text-sm text-[#1A1A1A]/40 font-medium tracking-widest uppercase text-[10px] font-bold">
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
                        className="absolute right-0 mt-4 w-56 bg-white border border-[#1A1A1A]/5 shadow-xl z-[90] py-2"
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
                {paginatedProducts.length > 0 ? (
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
                                onClick={() => setQuickViewProduct(product as unknown as Product)}
                                className="w-12 h-12 bg-white text-[#1A1A1A] flex items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => addToCompare(product as unknown as Product)}
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
                ) : (
                  <div className="py-24 text-center space-y-6">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-[#F5F0E1] rounded-full flex items-center justify-center">
                        <Filter className="w-8 h-8 text-[#D4AF37] opacity-20" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-serif text-[#1A1A1A]">No items found</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">Try adjusting your filters or search query.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedBrand("All");
                        setSelectedCategoryId(null);
                        setSelectedCollection("All");
                        setSelectedColor("All");
                        handleResetFilters();
                      }}
                      className="text-[10px] uppercase tracking-widest font-bold border-b-2 border-[#D4AF37] pb-1 hover:text-[#D4AF37] transition-colors"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}

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
