"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Star, Instagram } from "lucide-react";

const REVIEWS = [
  {
    id: 1,
    user: "Su Myat",
    handle: "@sumyat_fashion",
    comment: "The quality of the silk is amazing. It feels so premium and fits perfectly!",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
    stars: 5,
  },
  {
    id: 2,
    user: "Khin Wint Wah",
    handle: "@khin_wint_style",
    comment: "Amber Brand has truly captured the essence of modern Myanmar fashion. I love my new longyi!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400",
    stars: 5,
  },
  {
    id: 3,
    user: "Thandar",
    handle: "@thandar_official",
    comment: "Elegant, chic, and cultural. This is exactly what I've been looking for.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    stars: 5,
  },
  {
    id: 4,
    user: "Phyu Phyu",
    handle: "@phyu_styles",
    comment: "Best shopping experience in Yangon. Quick delivery and beautiful packaging.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    stars: 4,
  },
];

export default function ReviewGallery() {
  return (
    <section className="py-24 px-6 md:px-12 bg-[#F5F0E1]/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <Instagram className="w-8 h-8 text-[#D4AF37]" />
          <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A1A]">Amber Community</h2>
          <p className="text-[#1A1A1A]/60 max-w-md uppercase tracking-widest text-[10px] font-bold">
            Join the movement #AmberBrandFashion
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="bg-white p-6 shadow-sm border border-[#D4AF37]/10 flex flex-col space-y-4 group"
            >
              <div className="relative w-full aspect-square overflow-hidden mb-2">
                <Image 
                  src={review.image} 
                  alt={review.user} 
                  fill 
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                />
              </div>
              
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={
                      i < review.stars ? "text-[#D4AF37] fill-[#D4AF37] w-3 h-3" : "text-[#D4AF37]/20 w-3 h-3"
                    } 
                  />
                ))}
              </div>

              <p className="text-sm italic text-[#1A1A1A]/70 leading-relaxed font-sans">
                &quot;{review.comment}&quot;
              </p>

              <div className="pt-4 border-t border-[#D4AF37]/10 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">{review.user}</h4>
                  <span className="text-[10px] text-[#D4AF37] font-medium">{review.handle}</span>
                </div>
                <Instagram className="w-4 h-4 text-[#D4AF37]/40" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
