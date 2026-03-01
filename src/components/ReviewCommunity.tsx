"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Star, Instagram, MessageCircle, Heart } from "lucide-react";

const COMMUNITY_POSTS = [
  {
    id: 1,
    user: "Su Myat",
    handle: "@sumyat_fashion",
    comment: "The quality of the silk is amazing. It feels so premium and fits perfectly!",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
    stars: 5,
    likes: 124
  },
  {
    id: 2,
    user: "Khin Wint Wah",
    handle: "@khin_wint_style",
    comment: "Amber Brand has captured the essence of modern Myanmar. I love my new longyi!",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400&auto=format&fit=crop",
    stars: 5,
    likes: 89
  },
  {
    id: 3,
    user: "Thandar",
    handle: "@thandar_official",
    comment: "Elegant, chic, and cultural. This is exactly what I've been looking for.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop",
    stars: 5,
    likes: 210
  },
  {
    id: 4,
    user: "Phyu Phyu",
    handle: "@phyu_styles",
    comment: "Best shopping experience in Yangon. Quick delivery and beautiful packaging.",
    image: "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=400&auto=format&fit=crop",
    stars: 4,
    likes: 56
  },
];

export default function ReviewCommunity() {
  return (
    <section className="py-32 px-6 md:px-12 bg-[#FDFDFD]">
      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-px bg-[#D4AF37]" />
            <Instagram className="w-6 h-6 text-[#D4AF37]" />
            <div className="w-12 h-px bg-[#D4AF37]" />
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-serif text-[#1A1A1A]">Amber Community</h2>
            <p className="text-[#1A1A1A]/40 max-w-lg mx-auto uppercase tracking-[0.3em] text-[10px] font-bold">
              Join thousands of women defining modern Myanmar elegance. <br /> 
              Tag #AmberBrandFashion to be featured.
            </p>
          </div>
        </div>

        {/* Community Grid (Masonry-like) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {COMMUNITY_POSTS.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group bg-white"
            >
              <div className="relative aspect-square overflow-hidden mb-6 shadow-xl grayscale group-hover:grayscale-0 transition-all duration-700">
                <Image 
                  src={post.image} 
                  alt={post.user} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-[1.5s]" 
                />
                
                {/* Social Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-8">
                  <div className="flex items-center space-x-2 text-white">
                    <Heart className="w-5 h-5 fill-white" />
                    <span className="text-xs font-bold">{post.likes}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white">
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span className="text-xs font-bold">12</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 px-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">{post.handle}</span>
                  <div className="flex space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-2.5 h-2.5 ${i < post.stars ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#D4AF37]/20"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm italic text-[#1A1A1A]/60 leading-relaxed font-sans line-clamp-3">
                  &quot;{post.comment}&quot;
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="pt-12 flex flex-col items-center">
          <button className="bg-[#1A1A1A] text-white px-12 py-5 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#D4AF37] transition-all shadow-2xl">
            View Instagram Feed
          </button>
        </div>
      </div>
    </section>
  );
}
