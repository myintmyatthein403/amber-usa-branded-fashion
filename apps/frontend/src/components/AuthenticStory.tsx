"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import { ShieldCheck, Globe, DollarSign } from "lucide-react";
import Link from "next/link";

interface MissionData {
  badge: string;
  title: string;
  titleItalic: string;
  description: string;
  descriptionSecondary: string;
  featureOneTitle: string;
  featureOneDescription: string;
  featureTwoTitle: string;
  featureTwoDescription: string;
  trustBadgeText: string;
  imageMain: string;
  imageSecondary: string;
  ctaText: string;
  ctaLink: string;
}

export default function AuthenticStory() {
  const [data, setData] = useState<MissionData | null>(null);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/mission/active`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <section ref={containerRef} className="py-32 px-6 md:px-12 bg-white overflow-hidden min-h-[400px]">
      {!data ? (
        <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
          <div className="animate-pulse text-[#1A1A1A]/20 uppercase tracking-[0.4em] text-[10px] font-bold">
            Loading Authentic Story...
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            
            {/* Left: Multi-layered Images */}
            <div className="relative h-[700px] flex items-center justify-center">
              <motion.div style={{ y: y1 }} className="absolute top-0 right-0 w-[300px] h-[450px] shadow-2xl z-10 border-[12px] border-white bg-gray-100">
                <Image 
                  src={data.imageMain} 
                  alt="Mission Primary" 
                  fill 
                  className="object-cover" 
                />
              </motion.div>
              
              {data.imageSecondary && (
                <motion.div style={{ y: y2 }} className="absolute bottom-0 left-0 w-[350px] h-[500px] shadow-2xl z-0 overflow-hidden bg-gray-100">
                  <Image 
                    src={data.imageSecondary} 
                    alt="Mission Secondary" 
                    fill 
                    className="object-cover brightness-75" 
                  />
                </motion.div>
              )}

              {/* Floating Trust Badge */}
              <div className="absolute -bottom-10 right-10 bg-[#D4AF37] p-10 text-white shadow-2xl z-20 max-w-[220px]">
                <ShieldCheck className="w-10 h-10 mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                  {data.trustBadgeText}
                </p>
              </div>
            </div>

            {/* Right: Story Content */}
            <div className="space-y-12">
              <div className="space-y-6">
                <span className="text-[#D4AF37] text-[10px] uppercase font-bold tracking-[0.5em] block">{data.badge}</span>
                <h2 className="text-5xl md:text-7xl font-serif text-[#1A1A1A] leading-[1.1]">
                  {data.title} <br /> <span className="italic text-[#D4AF37]">{data.titleItalic}</span>
                </h2>
              </div>

              <div className="space-y-8 text-[#1A1A1A]/70 text-lg leading-relaxed font-sans max-w-lg">
                <p>
                  {data.description}
                </p>
                {data.descriptionSecondary && (
                  <p className="text-base">
                    {data.descriptionSecondary}
                  </p>
                )}
              </div>

              <div className="pt-8 border-t border-[#1A1A1A]/5 grid grid-cols-1 sm:grid-cols-2 gap-12">
                <div className="flex items-start space-x-4">
                  <Globe className="w-6 h-6 text-[#D4AF37] shrink-0" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]">{data.featureOneTitle}</h4>
                    <p className="text-xs text-[#1A1A1A]/40">{data.featureOneDescription}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <DollarSign className="w-6 h-6 text-[#D4AF37] shrink-0" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]">{data.featureTwoTitle}</h4>
                    <p className="text-xs text-[#1A1A1A]/40">{data.featureTwoDescription}</p>
                  </div>
                </div>
              </div>

              <Link href={data.ctaLink || "/shop"}>
                <button className="inline-flex items-center space-x-6 group">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#1A1A1A]">{data.ctaText}</span>
                  <div className="w-12 h-px bg-[#D4AF37] transition-all group-hover:w-24" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
