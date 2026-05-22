"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Instagram, Facebook, Mail, MapPin, Phone } from "lucide-react";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface FooterData {
  companyName: string;
  companySubtitle: string;
  companyDescription: string;
  instagramUrl?: string;
  facebookUrl?: string;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  copyrightText?: string;
}

const Footer = () => {
  const [data, setData] = useState<FooterData | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/footer-section/active`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return null;

  return (
    <footer className="bg-[#1A1A1A] text-white py-32 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mb-24">
          <div className="space-y-10">
            <div className="flex flex-col">
              <h2 className="text-4xl font-serif tracking-tighter uppercase text-white leading-none">{data.companyName}</h2>
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] mt-1 font-bold">{data.companySubtitle}</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs font-sans">
              {data.companyDescription}
            </p>
            <div className="flex space-x-8">
              {data.instagramUrl && (
                <a href={data.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-all transform hover:scale-110">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {data.facebookUrl && (
                <a href={data.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-all transform hover:scale-110">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-10">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D4AF37]">Shop Brands</h4>
            <ul className="space-y-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
              <li><Link href="/shop" className="hover:text-white transition-colors">Nike</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Coach</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Adidas</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Ralph Lauren</Link></li>
            </ul>
          </div>

          <div className="space-y-10">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D4AF37]">The Shop</h4>
            <ul className="space-y-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
              <li><Link href="#" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Authenticity Check</Link></li>
              <li><Link href="/gift-cards" className="hover:text-white transition-colors">Gift Cards</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-white transition-colors">Store Policy</Link></li>
            </ul>
          </div>

          <div className="space-y-10">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D4AF37]">Concierge</h4>
            <ul className="space-y-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
              {data.contactAddress && (
                <li className="flex items-center space-x-4">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" /> <span>{data.contactAddress}</span>
                </li>
              )}
              {data.contactPhone && (
                <li className="flex items-center space-x-4">
                  <Phone className="w-4 h-4 text-[#D4AF37]" /> <span>{data.contactPhone}</span>
                </li>
              )}
              {data.contactEmail && (
                <li className="flex items-center space-x-4">
                  <Mail className="w-4 h-4 text-[#D4AF37]" /> <span>{data.contactEmail}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">{data.copyrightText}</p>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <LanguageSwitcher />
            <CurrencySwitcher compact />
          </div>
          <div className="flex space-x-12 text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms-and-conditions" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Shipping from USA</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
