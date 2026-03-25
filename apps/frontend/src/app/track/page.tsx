"use client";

import { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "motion/react";
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

const MOCK_TRACKING_DATA: Record<string, any> = {
  "AMB-2026-0892": {
    status: "In Transit",
    currentLocation: "Yangon Sorting Center",
    estimatedDelivery: "March 2, 2026",
    timeline: [
      { status: "Order Placed", date: "Feb 28, 2026, 10:30 AM", completed: true },
      { status: "Processing", date: "Feb 28, 2026, 02:15 PM", completed: true },
      { status: "Shipped", date: "March 1, 2026, 09:00 AM", completed: true },
      { status: "In Transit", date: "March 1, 2026, 04:30 PM", completed: false },
      { status: "Delivered", date: "Expected March 2, 2026", completed: false },
    ]
  }
};

function TrackingContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("id") || "");
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const performTrack = (id: string) => {
    setIsSearching(true);
    setError("");
    
    // Simulate API delay
    setTimeout(() => {
      const data = MOCK_TRACKING_DATA[id.toUpperCase()];
      if (data) {
        setTrackingInfo(data);
      } else {
        setError("Order ID not found. Please check and try again.");
        setTrackingInfo(null);
      }
      setIsSearching(false);
    }, 1000);
  };

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setOrderId(id);
      performTrack(id);
    }
  }, [searchParams]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    performTrack(orderId);
  };

  return (
    <section className="pt-40 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
      <div className="text-center space-y-6 mb-16">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-[#F5F0E1] rounded-full flex items-center justify-center">
            <Package className="w-8 h-8 text-[#D4AF37]" />
          </div>
        </div>
        <h1 className="text-5xl font-serif text-[#1A1A1A]">Track Your Order</h1>
        <p className="text-[#1A1A1A]/40 uppercase tracking-[0.3em] text-[10px] font-bold">
          Real-time delivery updates for your authentic USA brands.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleTrack} className="max-w-xl mx-auto mb-20">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Enter Order ID (e.g. AMB-2026-0892)" 
            className="w-full p-6 bg-white border border-[#1A1A1A]/5 shadow-xl outline-none focus:border-[#D4AF37] transition-all font-serif text-lg text-center"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!orderId || isSearching}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-[#1A1A1A] text-white hover:bg-[#D4AF37] transition-all disabled:opacity-50"
          >
            {isSearching ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Clock className="w-5 h-5" />
              </motion.div>
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </button>
        </div>
        {error && <p className="mt-4 text-center text-red-500 text-xs font-bold uppercase tracking-widest">{error}</p>}
      </form>

      <AnimatePresence mode="wait">
        {trackingInfo && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 bg-white border border-[#1A1A1A]/5 shadow-sm space-y-4">
                <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/40 tracking-widest block">Current Status</span>
                <div className="flex items-center space-x-3 text-[#D4AF37]">
                  <Truck className="w-5 h-5" />
                  <span className="text-xl font-serif">{trackingInfo.status}</span>
                </div>
              </div>
              <div className="p-8 bg-white border border-[#1A1A1A]/5 shadow-sm space-y-4">
                <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/40 tracking-widest block">Last Location</span>
                <div className="flex items-center space-x-3 text-[#1A1A1A]">
                  <MapPin className="w-5 h-5" />
                  <span className="text-xl font-serif">{trackingInfo.currentLocation}</span>
                </div>
              </div>
              <div className="p-8 bg-white border border-[#1A1A1A]/5 shadow-sm space-y-4">
                <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/40 tracking-widest block">Est. Delivery</span>
                <div className="flex items-center space-x-3 text-[#1A1A1A]">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-xl font-serif">{trackingInfo.estimatedDelivery}</span>
                </div>
              </div>
            </div>

            {/* Visual Timeline */}
            <div className="bg-[#F5F0E1]/30 p-12 md:p-20 relative overflow-hidden">
              <div className="absolute inset-0 acheik-pattern opacity-10" />
              <div className="relative z-10 space-y-12 max-w-md mx-auto">
                {trackingInfo.timeline.map((item: any, idx: number) => (
                  <div key={idx} className="flex space-x-8 relative group">
                    {/* Vertical Line */}
                    {idx !== trackingInfo.timeline.length - 1 && (
                      <div className={cn(
                        "absolute left-4 top-8 bottom-[-32px] w-px",
                        item.completed ? "bg-[#D4AF37]" : "bg-[#1A1A1A]/10 border-dashed border-l"
                      )} />
                    )}
                    
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all",
                      item.completed ? "bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/20" : "bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/20"
                    )}>
                      {item.completed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className={cn("text-sm font-bold uppercase tracking-widest", item.completed ? "text-[#1A1A1A]" : "text-[#1A1A1A]/30")}>
                        {item.status}
                      </h4>
                      <p className="text-xs text-[#1A1A1A]/40 font-medium">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-12 text-center">
              <div className="inline-flex items-center space-x-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#1A1A1A]/40">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>100% Authentic Products Secured by Amber Premium</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default function TrackingPage() {
  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Navbar />
      <Suspense fallback={<div className="pt-40 text-center">Loading tracking details...</div>}>
        <TrackingContent />
      </Suspense>
    </main>
  );
}
