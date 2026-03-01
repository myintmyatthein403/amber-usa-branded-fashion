"use client";

import { useState } from "react";
import { Star, ThumbsUp, MessageSquare, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const MOCK_REVIEWS = [
  {
    id: 1,
    user: "Thiri",
    date: "2 days ago",
    rating: 5,
    comment: "This is 100% authentic. I checked the QR code and it's legit. The quality is exactly what you expect from this brand. Delivery was very quick too!",
    likes: 12,
    verified: true
  },
  {
    id: 2,
    user: "Min Khant",
    date: "1 week ago",
    rating: 4,
    comment: "Fair price for Myanmar market. Usually these items are much more expensive if you order yourself. Good job guys.",
    likes: 5,
    verified: true
  }
];

export default function ProductReviews() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <section className="py-24 border-t border-[#1A1A1A]/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <div className="space-y-4">
            <h2 className="text-4xl font-serif text-[#1A1A1A]">Customer Reviews</h2>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
                ))}
              </div>
              <span className="text-xl font-bold">4.8</span>
              <span className="text-sm text-[#1A1A1A]/40 font-medium">(Based on 124 reviews)</span>
            </div>
          </div>
          
          <button className="bg-[#1A1A1A] text-white px-10 py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#D4AF37] transition-all shadow-xl">
            Write a Review
          </button>
        </div>

        <div className="flex border-b border-[#1A1A1A]/5 mb-12">
          {["all", "with photos", "verified"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-4 px-8 text-[10px] font-bold uppercase tracking-widest transition-all relative",
                activeTab === tab ? "text-[#1A1A1A]" : "text-[#1A1A1A]/30 hover:text-[#1A1A1A]/60"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="reviewTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />
              )}
            </button>
          ))}
        </div>

        <div className="space-y-12">
          {MOCK_REVIEWS.map((review) => (
            <motion.div 
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 pb-12 border-b border-[#1A1A1A]/5"
            >
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#1A1A1A]">{review.user}</span>
                  <span className="text-[10px] text-[#1A1A1A]/40 font-bold uppercase tracking-widest">{review.date}</span>
                </div>
                {review.verified && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Verified Buyer</span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("w-3 h-3", i < review.rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#D4AF37]/20")} />
                  ))}
                </div>
                <p className="text-base text-[#1A1A1A]/70 leading-relaxed font-sans italic">
                  &quot;{review.comment}&quot;
                </p>
                <div className="flex items-center space-x-6">
                  <button className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40 hover:text-[#D4AF37] transition-colors">
                    <ThumbsUp className="w-3 h-3" />
                    <span>Helpful ({review.likes})</span>
                  </button>
                  <button className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40 hover:text-[#D4AF37] transition-colors">
                    <MessageSquare className="w-3 h-3" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="pt-12 text-center">
          <button className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#1A1A1A]/40 hover:text-[#D4AF37] transition-colors">
            Load More Reviews
          </button>
        </div>
      </div>
    </section>
  );
}
