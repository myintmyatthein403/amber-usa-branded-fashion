"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Gift, ArrowRight } from "lucide-react";

interface GiftCardSectionData {
  badge: string;
  title: string;
  titleSecondary: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  cardTitle: string;
  cardAmount: string;
  cardType: string;
}

interface ResponseData {
  data: GiftCardSectionData;
}

export default function GiftCardBanner() {
  const [data, setData] = useState<ResponseData | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/gift-card-section/active`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return null;

  return (
    <section className="py-24 px-6 md:px-12 bg-[#1A1A1A] overflow-hidden relative">
      <div className="absolute inset-0 acheik-pattern opacity-5" />

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex flex-col items-start space-y-6 max-w-xl">
          <div className="flex items-center space-x-3 text-[#D4AF37]">
            <Gift className="w-6 h-6" />
            <span className="text-[10px] uppercase font-bold tracking-[0.4em]">{data.data.badge}</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight">
            {data.data.title} <br /> {data.data.titleSecondary}
          </h2>
          <p className="text-white/40 text-lg font-sans leading-relaxed">
            {data.data.description}
          </p>
          <Link
            href={data.data.ctaLink || "/gift-cards"}
            className="group flex items-center space-x-6 pt-4"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">{data.data.ctaText}</span>
            <div className="w-12 h-px bg-[#D4AF37] transition-all group-hover:w-24" />
            <ArrowRight className="w-4 h-4 text-[#D4AF37] transition-transform group-hover:translate-x-2" />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 50, rotate: 5 }}
          whileInView={{ opacity: 1, x: 0, rotate: -5 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-full max-w-md aspect-[1.6/1] bg-gradient-to-br from-[#D4AF37] to-[#F5F0E1] rounded-2xl shadow-[0_20px_50px_rgba(212,175,55,0.3)] p-10 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute inset-0 acheik-pattern opacity-20" />
          <div className="relative h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <h3 className="text-2xl font-serif tracking-tighter uppercase text-[#1A1A1A]">{data.data.cardTitle}</h3>
              <Gift className="w-8 h-8 text-[#1A1A1A]/20" />
            </div>
            <div className="space-y-1 text-[#1A1A1A]">
              <span className="text-[8px] uppercase tracking-widest font-bold opacity-40">{data.data.cardType}</span>
              <p className="text-3xl font-serif">{data.data.cardAmount}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
