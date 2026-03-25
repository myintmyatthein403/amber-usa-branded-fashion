import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import QuickBuy from "@/components/QuickBuy";
import GiftCardBanner from "@/components/GiftCardBanner";
import AuthenticStory from "@/components/AuthenticStory";
import SaleSection from "@/components/SaleSection";
import ReviewCommunity from "@/components/ReviewCommunity";
import Testimonials from "@/components/Testimonials";
import { ShieldCheck, Globe, DollarSign } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#FDFDFD]">
      <Navbar />
      
      {/* 2026 Trend: Animated Hero Section */}
      <Hero />

      {/* Trust Banner (USA Focus) */}
      <section className="bg-[#1A1A1A] text-white py-6 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-8">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">100% Authentic Guarantee</span>
          </div>
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Directly Imported from USA</span>
          </div>
          <div className="flex items-center space-x-3">
            <DollarSign className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Fairest Pricing in Myanmar</span>
          </div>
        </div>
      </section>

      {/* Authentic Story Section */}
      <AuthenticStory />

      {/* Thingyan Sale Event (New) */}
      <SaleSection />

      {/* New Arrivals Section */}
      <ProductGrid title="New Arrivals" filter={{ isNewArrival: true }} />

      {/* Quick Buy Spotlight */}
      <QuickBuy />

      {/* Gift Card Promotion (New) */}
      <GiftCardBanner />

      {/* Best Sellers Section */}
      <ProductGrid title="Best Sellers" filter={{ isBestSeller: true }} />

      {/* Customer Review & Community */}
      <ReviewCommunity />

      {/* Testimonials (New) */}
      <Testimonials />
    </main>
  );
}
