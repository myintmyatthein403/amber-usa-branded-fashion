"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { ShoppingBag, Timer, ArrowRight, Percent } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface SaleSectionData {
  badge: string;
  title: string;
  titleItalic: string;
  description: string;
  endDate: string;
  ctaText: string;
  ctaLink: string;
  imageMain: string;
}

export default function SaleSection() {
  const [data, setData] = useState<SaleSectionData | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/sale-section/active`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!data?.endDate) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(data.endDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [data]);

  if (!data) return null;

  return (
    <section className="py-24 px-6 md:px-12 bg-[#1A1A1A] relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 acheik-pattern opacity-10" />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37] rounded-full blur-[150px] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Left: Sale Info */}
          <div className="flex-1 space-y-10 text-center lg:text-left">
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start space-x-3 text-[#D4AF37]">
                <Percent className="w-6 h-6" />
                <span className="text-[10px] uppercase font-bold tracking-[0.5em]">{data.badge}</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-serif text-white leading-tight">
                {data.title} <br />
                <span className="italic text-[#D4AF37]">{data.titleItalic}</span>
              </h2>
              <p className="text-white/40 text-lg font-sans max-w-lg mx-auto lg:mx-0">
                {data.description}
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="grid grid-cols-4 gap-4 max-w-md mx-auto lg:mx-0">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Mins", value: timeLeft.minutes },
                { label: "Secs", value: timeLeft.seconds }
              ].map((item) => (
                <div key={item.label} className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-sm">
                  <div className="text-2xl md:text-4xl font-serif text-white">{String(item.value).padStart(2, '0')}</div>
                  <div className="text-[8px] uppercase tracking-widest text-[#D4AF37] font-bold mt-1">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8 pt-4">
              <Link href={data.ctaLink || "/shop"}>
                <button className="bg-[#D4AF37] text-[#1A1A1A] px-12 py-5 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-white transition-all duration-500 flex items-center space-x-4 group">
                  <ShoppingBag className="w-4 h-4" />
                  <span>{data.ctaText}</span>
                </button>
              </Link>
              <div className="flex items-center space-x-4 text-white/20">
                <Timer className="w-5 h-5" />
                <span className="text-[10px] uppercase tracking-widest font-bold italic">Hurry, prices increase soon</span>
              </div>
            </div>
          </div>

          {/* Right: Visual Side */}
          <div className="flex-1 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative aspect-square md:aspect-video lg:aspect-square w-full bg-white/5 rounded-sm overflow-hidden border border-white/10"
            >
              <Image
                src={data.imageMain}
                alt="Limited Sale Event"
                fill
                className="object-cover transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent opacity-60" />
              
              {/* Floating Discount Badge */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-10 right-10 bg-[#D4AF37] w-24 h-24 rounded-full flex flex-col items-center justify-center text-[#1A1A1A] shadow-2xl z-20"
              >
                <span className="text-[8px] uppercase font-bold tracking-widest">Up To</span>
                <span className="text-3xl font-serif leading-none">40%</span>
                <span className="text-[8px] uppercase font-bold tracking-widest">Off</span>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
