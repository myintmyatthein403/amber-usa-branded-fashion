"use client";

import { useEffect, useState } from "react";
import { Star, ThumbsUp, MessageSquare, ShieldCheck, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { getApiUrl } from "@/lib/api";
import type { ApiReview } from "@amber/shared";

const MOCK_REVIEWS: ApiReview[] = [
  {
    id: "mock-1",
    rating: 5,
    comment: "This is 100% authentic. I checked the QR code and it's legit. The quality is exactly what you expect from this brand. Delivery was very quick too!",
    userName: "Thiri",
    userProfileUrl: null,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    platform: "WEBSITE",
    isVerifiedPurchase: true,
  },
  {
    id: "mock-2",
    rating: 4,
    comment: "Fair price for Myanmar market. Usually these items are much more expensive if you order yourself. Good job guys.",
    userName: "Min Khant",
    userProfileUrl: null,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    platform: "WEBSITE",
    isVerifiedPurchase: true,
  },
];

interface ProductReviewsProps {
  reviews?: ApiReview[];
  productId?: string;
  avgRating?: number | string;
  reviewCount?: number;
}

export default function ProductReviews({
  reviews = [],
  productId,
  avgRating,
  reviewCount,
}: ProductReviewsProps) {
  const [activeTab, setActiveTab] = useState("all");
  const usingRealReviews = reviews.length > 0;
  const displayReviews = usingRealReviews ? reviews : MOCK_REVIEWS;

  const { isAuthenticated, token } = useAuthStore();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [eligible, setEligible] = useState<{ eligible: boolean; orderItemId?: string } | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Real average, computed server-side and denormalized on Product — falls
  // back to computing from whatever's in `reviews` only when the caller
  // doesn't have the aggregate yet (e.g. mock data path).
  const displayAvg =
    avgRating != null
      ? Number(avgRating)
      : displayReviews.length > 0
        ? displayReviews.reduce((acc, r) => acc + r.rating, 0) / displayReviews.length
        : 0;
  const displayCount = reviewCount ?? displayReviews.length;

  const openReviewModal = async () => {
    if (!isAuthenticated || !token || !productId) {
      setIsReviewModalOpen(true);
      return;
    }
    setIsReviewModalOpen(true);
    setCheckingEligibility(true);
    try {
      const res = await fetch(`${getApiUrl()}/reviews/eligibility/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setEligible(json?.data ?? json);
    } catch {
      setEligible({ eligible: false });
    } finally {
      setCheckingEligibility(false);
    }
  };

  useEffect(() => {
    if (!isReviewModalOpen) {
      setSubmitted(false);
      setSubmitError(null);
      setRating(5);
      setComment("");
    }
  }, [isReviewModalOpen]);

  const handleSubmitReview = async () => {
    if (!token || !productId || !eligible?.orderItemId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${getApiUrl()}/reviews/customer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          orderItemId: eligible.orderItemId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error((json as { message?: string })?.message || "Failed to submit review");
      }
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-24 border-t border-[#1A1A1A]/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <div className="space-y-4">
            <h2 className="text-4xl font-serif text-[#1A1A1A]">Customer Reviews</h2>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-5 h-5",
                      i < Math.round(displayAvg) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#D4AF37]/20",
                    )}
                  />
                ))}
              </div>
              <span className="text-xl font-bold">{displayAvg > 0 ? displayAvg.toFixed(1) : "—"}</span>
              <span className="text-sm text-[#1A1A1A]/40 font-medium">
                (Based on {displayCount} review{displayCount !== 1 ? "s" : ""})
              </span>
            </div>
          </div>

          <button
            onClick={openReviewModal}
            className="bg-[#1A1A1A] text-white px-10 py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#D4AF37] transition-all shadow-xl"
          >
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
          {(activeTab === "verified" ? displayReviews.filter((r) => r.isVerifiedPurchase) : displayReviews).map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 pb-12 border-b border-[#1A1A1A]/5"
            >
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#1A1A1A]">{review.userName}</span>
                  <span className="text-[10px] text-[#1A1A1A]/40 font-bold uppercase tracking-widest">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {review.isVerifiedPurchase && (
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
                    <span>Helpful</span>
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
      </div>

      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white p-10 shadow-2xl space-y-6"
            >
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute top-6 right-6 text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
              >
                <X className="w-6 h-6" />
              </button>

              {!isAuthenticated ? (
                <div className="text-center space-y-4 py-6">
                  <h3 className="text-2xl font-serif">Sign In Required</h3>
                  <p className="text-sm text-[#1A1A1A]/60">
                    Please sign in to write a review for a product you&apos;ve purchased.
                  </p>
                </div>
              ) : submitted ? (
                <div className="text-center space-y-4 py-6">
                  <h3 className="text-2xl font-serif">Thank You!</h3>
                  <p className="text-sm text-[#1A1A1A]/60">
                    Your review has been submitted and will appear once our team approves it.
                  </p>
                </div>
              ) : checkingEligibility ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
                </div>
              ) : !eligible?.eligible ? (
                <div className="text-center space-y-4 py-6">
                  <h3 className="text-2xl font-serif">No Eligible Purchase Found</h3>
                  <p className="text-sm text-[#1A1A1A]/60">
                    You can write a review once you&apos;ve received a completed order containing this product.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-serif">Write a Review</h3>
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setRating(n)}>
                        <Star className={cn("w-8 h-8", n <= rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#D4AF37]/20")} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts on this product..."
                    className="w-full p-4 bg-[#F5F0E1]/30 border border-[#1A1A1A]/5 outline-none focus:border-[#D4AF37] text-sm resize-none"
                  />
                  {submitError && <p className="text-xs text-red-500 font-medium italic">{submitError}</p>}
                  <button
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    className="w-full py-4 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Submit Review
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
