"use client";

import { useState, useEffect, useRef } from "react";
import { ShoppingBag, Menu, X, Search, User, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import SearchOverlay from "./SearchOverlay";
import CurrencySwitcher from "./CurrencySwitcher";

interface NavCategory {
  id: string;
  name: string;
  isActive?: boolean;
  parentId?: string | null;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ads, setAds] = useState<any[]>([]);
  const [avatarError, setAvatarError] = useState(false);
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  const isSearchOpen = useStore((state) => state.isSearchOpen);
  const setSearchOpen = useStore((state) => state.setSearchOpen);
  const isCartAnimating = useStore((state) => state.isCartAnimating);
  const setCartOpen = useStore((state) => state.setCartOpen);
  const cartCount = useStore((state) => state.getCartCount());
  const setExchangeRate = useStore((state) => state.setExchangeRate);
  const setRateMeta = useStore((state) => state.setRateMeta);
  const { user, isAuthenticated, hasHydrated } = useAuthStore();

  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar]);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    // Fetch global exchange rate
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
        const data = await response.json();
        if (data.usdToMmkRate) {
          setExchangeRate(parseFloat(data.usdToMmkRate));
        }
        setRateMeta({
          rateUpdatedAt: data.rateUpdatedAt ?? null,
          lockedRateNote:
            data.rateSource === "exchange_rates"
              ? "Exchange rate is locked at checkout"
              : undefined,
        });
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
      }
    };
    fetchSettings();

    // Fetch Top Bar Ads
    const fetchAds = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads/active?placement=TOP_BAR`);
        const data = await response.json();
        setAds(data);
      } catch (error) {
        console.error("Failed to fetch ads:", error);
      }
    };
    fetchAds();

    // Fetch top-level categories for the nav dropdown
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories?limit=100`);
        const result = await response.json();
        const data: NavCategory[] = result?.data ?? result ?? [];
        setCategories(data.filter((c) => c.isActive !== false && !c.parentId));
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [setExchangeRate]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const announcementMessages = ads.length > 0 
    ? ads.map(ad => ad.title)
    : [
        "🔥 Thingyan Festival Sale: Up to 40% OFF on all USA Brands",
        "✨ New Arrivals from Nike & Coach Just Landed",
        "🚚 Free Express Delivery for Gold Members"
      ];

  return (
    <>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />
      
      {/* Sale Announcement Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-[#D4AF37] text-[#1A1A1A] py-2 px-6 overflow-hidden">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.3em] flex items-center space-x-12 w-max"
        >
          {/* Duplicate for infinite loop */}
          {[...announcementMessages, ...announcementMessages].map((msg, i) => (
            <span key={i}>{msg}</span>
          ))}
        </motion.div>
      </div>

      <nav
        className={cn(
          "fixed top-8 left-0 right-0 w-full z-50 transition-all duration-500 py-4 px-6 md:px-12",
          isScrolled ? "bg-background/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 text-[10px] uppercase tracking-widest font-bold">
            <Link href="/shop" className="hover:text-[#D4AF37] transition-colors">Shop All</Link>
            <Link href="/gift-cards" className="hover:text-[#D4AF37] transition-colors">Gift Cards</Link>
            {categories.length > 0 && (
              <div className="relative" ref={categoryMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsCategoryMenuOpen((v) => !v)}
                  className="flex items-center gap-1 hover:text-[#D4AF37] transition-colors"
                >
                  <span>Categories</span>
                  <ChevronDown className={cn("w-3 h-3 transition-transform", isCategoryMenuOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {isCategoryMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 mt-4 w-56 bg-white border border-[#1A1A1A]/5 shadow-xl z-[90] py-2 normal-case"
                    >
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/shop?category=${cat.id}`}
                          onClick={() => setIsCategoryMenuOpen(false)}
                          className="block px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-zinc-50 transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Center: Logo */}
          <Link 
            href="/"
            className="flex flex-col items-center cursor-pointer group"
          >
            <h1 className="text-2xl md:text-3xl font-serif tracking-tighter uppercase text-foreground group-hover:text-[#D4AF37] transition-colors">
              Amber
            </h1>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] -mt-1 font-semibold">
              Premium USA Brands
            </span>
          </Link>

          {/* Right: Icons */}
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="hidden lg:block">
              <CurrencySwitcher />
            </div>
            <button 
              onClick={() => setSearchOpen(true)}
              className="hover:text-[#D4AF37] transition-colors hidden sm:block"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link href="/profile" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2">
              {hasHydrated && isAuthenticated ? (
                <div className="w-6 h-6 rounded-full overflow-hidden border border-[#D4AF37] flex items-center justify-center bg-[#D4AF37]/10">
                  {user?.avatar && !avatarError ? (
                    <img
                      src={user.avatar}
                      alt={user.name || ""}
                      className="w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-[#D4AF37]">{user?.name?.charAt(0) || "A"}</span>
                  )}
                </div>
              ) : (
                <User className="w-5 h-5" />
              )}
              {hasHydrated && isAuthenticated && user?.name && (
                <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:block">
                  {user.name.split(' ')[0]}
                </span>
              )}
            </Link>
            <button 
              onClick={() => setCartOpen(true)}
              className="hover:text-[#D4AF37] transition-colors relative"
            >
              <motion.div
                animate={isCartAnimating ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <ShoppingBag className="w-5 h-5" />
              </motion.div>
                <AnimatePresence>
                  {mounted && cartCount > 0 && (
                    <motion.span
                      initial={false}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-[#D4AF37] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold"
                      suppressHydrationWarning
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
            </button>
            <button
              className="md:hidden hover:text-[#D4AF37] transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background flex flex-col items-center justify-center p-8 md:hidden"
          >
            <div className="flex flex-col space-y-8 text-center text-3xl font-serif overflow-y-auto max-h-[70vh] px-4">
              <Link href="/shop" className="hover:text-[#D4AF37] transition-colors" onClick={() => setIsMenuOpen(false)}>Shop</Link>
              <Link href="/gift-cards" className="hover:text-[#D4AF37] transition-colors" onClick={() => setIsMenuOpen(false)}>Gift Cards</Link>
              <Link href="/profile" className="hover:text-[#D4AF37] transition-colors" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.id}`}
                  className="text-lg text-[#1A1A1A]/60 hover:text-[#D4AF37] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
            
            <div className="mt-12">
              <CurrencySwitcher />
            </div>

            <button 
              onClick={() => setIsMenuOpen(false)}
              className="mt-12 text-sm uppercase tracking-widest text-[#1A1A1A]/60 font-bold"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
