"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X, Search, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import SearchOverlay from "./SearchOverlay";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isSearchOpen = useStore((state) => state.isSearchOpen);
  const setSearchOpen = useStore((state) => state.setSearchOpen);
  const isCartAnimating = useStore((state) => state.isCartAnimating);
  const setCartOpen = useStore((state) => state.setCartOpen);
  const cartCount = useStore((state) => state.getCartCount());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />
      
      {/* Sale Announcement Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-[#D4AF37] text-[#1A1A1A] py-2 px-6 overflow-hidden">
        <motion.div 
          animate={{ x: ["100%", "-100%"] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.3em] flex items-center space-x-12"
        >
          <span>🔥 Thingyan Festival Sale: Up to 40% OFF on all USA Brands</span>
          <span>✨ New Arrivals from Nike & Coach Just Landed</span>
          <span>🚚 Free Express Delivery for Gold Members</span>
          <span>🔥 Thingyan Festival Sale: Up to 40% OFF on all USA Brands</span>
        </motion.div>
      </div>

      <nav
        className={cn(
          "fixed top-8 left-0 right-0 w-full z-50 transition-all duration-500 py-4 px-6 md:px-12",
          isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 text-[10px] uppercase tracking-widest font-bold">
            <Link href="/shop" className="hover:text-[#D4AF37] transition-colors">Shop All</Link>
            <Link href="/gift-cards" className="hover:text-[#D4AF37] transition-colors">Gift Cards</Link>
            <Link href="#" className="hover:text-[#D4AF37] transition-colors">USA Brands</Link>
            <Link href="#" className="hover:text-[#D4AF37] transition-colors">Authenticity</Link>
          </div>

          {/* Center: Logo */}
          <Link 
            href="/"
            className="flex flex-col items-center cursor-pointer group"
          >
            <h1 className="text-2xl md:text-3xl font-serif tracking-tighter uppercase text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors">
              Amber
            </h1>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] -mt-1 font-semibold">
              Premium USA Brands
            </span>
          </Link>

          {/* Right: Icons */}
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setSearchOpen(true)}
              className="hover:text-[#D4AF37] transition-colors hidden sm:block"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link href="/profile" className="hover:text-[#D4AF37] transition-colors">
              <User className="w-5 h-5" />
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
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-[#D4AF37] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold"
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
            className="fixed inset-0 z-40 bg-[#F5F0E1] flex flex-col items-center justify-center p-8 md:hidden"
          >
            <div className="flex flex-col space-y-8 text-center text-3xl font-serif">
              <Link href="/shop" className="hover:text-[#D4AF37] transition-colors" onClick={() => setIsMenuOpen(false)}>Shop</Link>
              <Link href="/gift-cards" className="hover:text-[#D4AF37] transition-colors" onClick={() => setIsMenuOpen(false)}>Gift Cards</Link>
              <Link href="/profile" className="hover:text-[#D4AF37] transition-colors" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
              <Link href="#" className="hover:text-[#D4AF37] transition-colors" onClick={() => setIsMenuOpen(false)}>USA Brands</Link>
              <Link href="#" className="hover:text-[#D4AF37] transition-colors" onClick={() => setIsMenuOpen(false)}>Best Sellers</Link>
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
