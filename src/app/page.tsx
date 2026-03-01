import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import QuickBuy from "@/components/QuickBuy";
import GiftCardBanner from "@/components/GiftCardBanner";
import AuthenticStory from "@/components/AuthenticStory";
import SaleSection from "@/components/SaleSection";
import ReviewCommunity from "@/components/ReviewCommunity";
import Testimonials from "@/components/Testimonials";
import { Instagram, Facebook, Mail, MapPin, Phone, ShieldCheck, Globe, DollarSign } from "lucide-react";

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
      <ProductGrid title="New Arrivals" />

      {/* Quick Buy Spotlight */}
      <QuickBuy />

      {/* Gift Card Promotion (New) */}
      <GiftCardBanner />

      {/* Best Sellers Section */}
      <ProductGrid title="Best Sellers" />

      {/* Customer Review & Community */}
      <ReviewCommunity />

      {/* Testimonials (New) */}
      <Testimonials />

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-32 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mb-24">
            <div className="space-y-10">
              <div className="flex flex-col">
                <h2 className="text-4xl font-serif tracking-tighter uppercase text-white leading-none">Amber</h2>
                <span className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] mt-1 font-bold">Premium USA Brands</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs font-sans">
                Amber Premium is Myanmar&apos;s trusted destination for authentic USA branded fashion. 
                Bringing global quality to your doorstep at competitive prices.
              </p>
              <div className="flex space-x-8">
                <a href="#" className="hover:text-[#D4AF37] transition-all transform hover:scale-110"><Instagram className="w-5 h-5" /></a>
                <a href="https://www.facebook.com/amberbrandfashion" className="hover:text-[#D4AF37] transition-all transform hover:scale-110"><Facebook className="w-5 h-5" /></a>
              </div>
            </div>

            <div className="space-y-10">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D4AF37]">Shop Brands</h4>
              <ul className="space-y-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
                <li><a href="/shop" className="hover:text-white transition-colors">Nike</a></li>
                <li><a href="/shop" className="hover:text-white transition-colors">Coach</a></li>
                <li><a href="/shop" className="hover:text-white transition-colors">Adidas</a></li>
                <li><a href="/shop" className="hover:text-white transition-colors">Ralph Lauren</a></li>
              </ul>
            </div>

            <div className="space-y-10">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D4AF37]">The Shop</h4>
              <ul className="space-y-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
                <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Authenticity Check</a></li>
                <li><a href="/gift-cards" className="hover:text-white transition-colors">Gift Cards</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Store Policy</a></li>
              </ul>
            </div>

            <div className="space-y-10">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D4AF37]">Concierge</h4>
              <ul className="space-y-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
                <li className="flex items-center space-x-4"><MapPin className="w-4 h-4 text-[#D4AF37]" /> <span>Yangon, Myanmar</span></li>
                <li className="flex items-center space-x-4"><Phone className="w-4 h-4 text-[#D4AF37]" /> <span>+95 9 123 456 789</span></li>
                <li className="flex items-center space-x-4"><Mail className="w-4 h-4 text-[#D4AF37]" /> <span>hello@amberpremium.com</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">© 2026 Amber Premium. Authentic USA Brands.</p>
            <div className="flex space-x-12 text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Shipping from USA</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
