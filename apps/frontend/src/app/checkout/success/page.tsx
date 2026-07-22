"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/store/useStore";
import { motion } from "motion/react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get("payment_intent");
  const orderId = searchParams.get("orderId");
  const redirectStatus = searchParams.get("redirect_status");
  
  const clearCart = useStore((state) => state.clearCart);
  const [status, setStatus] = useState<"loading" | "pending" | "success" | "error">("loading");

  const MAX_ATTEMPTS = 5;
  const RETRY_DELAY_MS = 2000;

  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      return;
    }

    let cancelled = false;

    const verifyPayment = async (attempt: number) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/verify-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const data = await res.json();
        const response = data.data || data;

        if (cancelled) return;

        if (response.success && response.status === 'PAID') {
          setStatus("success");
          clearCart();
        } else if (response.status === 'FAILED') {
          setStatus("error");
        } else if (attempt < MAX_ATTEMPTS) {
          setTimeout(() => verifyPayment(attempt + 1), RETRY_DELAY_MS);
        } else {
          setStatus("pending");
        }
      } catch (error) {
        console.error("Payment verification failed:", error);
        if (!cancelled) setStatus("error");
      }
    };

    verifyPayment(1);

    return () => {
      cancelled = true;
    };
  }, [orderId, clearCart]);

  return (
    <main className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-8 p-12 bg-white shadow-2xl border border-[#D4AF37]/10"
      >
        {status === "loading" && (
          <div className="p-12 text-center animate-pulse uppercase tracking-widest text-[10px] font-bold">Verifying Payment...</div>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-[#F5F0E1] rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-[#D4AF37]" />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-serif text-[#1A1A1A]">Payment Successful</h1>
              <p className="text-[#1A1A1A]/60 text-sm leading-relaxed">
                Thank you for your purchase. Your payment was processed successfully. 
                We are now preparing your order.
              </p>
              {orderId && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                  Order ID: {orderId}
                </p>
              )}
            </div>

            {/* Order Summary */}
            {orderId && (
              <div className="mt-6 p-6 bg-[#F5F0E1]/30 rounded-lg border border-[#D4AF37]/10">
                <h3 className="text-lg font-serif font-bold mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <p className="text-[#1A1A1A]/40">Estimated Delivery: 3-5 business days</p>
                  <p className="text-[#1A1A1A]/40">Tracking will be sent via email when order ships</p>
                  <div className="pt-3 border-t border-[#1A1A1A]/5 mt-3">
                    <p className="text-xs text-[#1A1A1A]/40">
                      For USA-to-Myanmar orders, please allow additional 7-14 days for customs clearance.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-4 pt-4">
              <Link 
                href="/profile" 
                className="block w-full bg-[#1A1A1A] text-white py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#D4AF37] transition-all shadow-xl"
              >
                View Order History
              </Link>
              <Link 
                href="/shop" 
                className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        )}

        {status === "pending" && (
          <>
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-[#F5F0E1] rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-[#D4AF37]" />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-serif text-[#1A1A1A]">Payment Still Processing</h1>
              <p className="text-[#1A1A1A]/60 text-sm leading-relaxed">
                Your payment is taking longer than expected to confirm. This can happen with some
                payment methods — check your order history shortly, or contact support if it
                doesn&apos;t update within a few minutes.
              </p>
              {orderId && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                  Order ID: {orderId}
                </p>
              )}
            </div>
            <div className="flex flex-col space-y-4 pt-4">
              <Link
                href="/profile"
                className="block w-full bg-[#1A1A1A] text-white py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#D4AF37] transition-all shadow-xl"
              >
                View Order History
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-serif text-[#1A1A1A]">Payment Failed</h1>
              <p className="text-[#1A1A1A]/60 text-sm leading-relaxed">
                Something went wrong with your payment. Please try again or contact support if the issue persists.
              </p>
            </div>
            <div className="flex flex-col space-y-4">
              <Link 
                href="/checkout" 
                className="block w-full bg-[#1A1A1A] text-white py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#D4AF37] transition-all shadow-xl"
              >
                Return to Checkout
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </main>
  );
}
