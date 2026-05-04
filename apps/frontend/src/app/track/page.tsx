"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "motion/react";
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

interface TimelineItem {
  status: string;
  date: string;
  completed: boolean;
}

interface TrackingInfo {
  status: string;
  currentLocation: string;
  estimatedDelivery: string;
  timeline: TimelineItem[];
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [localOrderId, setLocalOrderId] = useState(searchParams.get("id") || "");

  const formatTimelineDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeline = (order: { createdAt: string; updatedAt: string; status: string; paymentStatus: string }) => {
    const timeline = [
      { status: "Order Placed", date: formatTimelineDate(order.createdAt), completed: true },
    ];

    if (order.paymentStatus === 'PAID') {
      timeline.push({ status: "Payment Verified", date: formatTimelineDate(order.updatedAt), completed: true });
    } else {
      timeline.push({ status: "Awaiting Payment", date: "Pending verification", completed: false });
    }

    const statusMap: Record<string, { label: string, weight: number }> = {
      'PENDING': { label: 'Processing', weight: 1 },
      'PROCESSING': { label: 'Preparing for shipment', weight: 2 },
      'DELIVERING': { label: 'Shipped', weight: 3 },
      'COMPLETED': { label: 'Delivered', weight: 4 },
      'CANCELLED': { label: 'Cancelled', weight: 0 },
      'REFUNDED': { label: 'Refunded', weight: 0 }
    };

    const currentStatus = statusMap[order.status] || { label: order.status, weight: 1 };
    
    if (order.status !== 'CANCELLED' && order.status !== 'REFUNDED') {
      timeline.push({ 
        status: currentStatus.label, 
        date: order.status === 'PENDING' ? "Processing your items" : formatTimelineDate(order.updatedAt), 
        completed: currentStatus.weight >= 2 
      });

      timeline.push({ 
        status: "Delivered", 
        date: order.status === 'COMPLETED' ? formatTimelineDate(order.updatedAt) : "Expected soon", 
        completed: order.status === 'COMPLETED' 
      });
    } else {
      timeline.push({ status: order.status, date: formatTimelineDate(order.updatedAt), completed: true });
    }

    return timeline;
  };

  const performTrack = useCallback(async (id: string) => {
    if (!id) return;
    setIsSearching(true);
    setError("");
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/track/${id}`);
      if (!response.ok) {
        throw new Error("Order not found");
      }
      const json = await response.json();
      const order = json.data;
      
      setTrackingInfo({
        status: order.status,
        currentLocation: order.status === 'DELIVERING' ? "In transit to destination" : "Amber Facility",
        estimatedDelivery: order.status === 'COMPLETED' ? "Delivered" : "3-5 Business Days",
        timeline: getTimeline(order)
      });
    } catch (err) {
      setError("Order ID not found. Please check and try again.");
      setTrackingInfo(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      performTrack(id);
    }
  }, [searchParams, performTrack]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    performTrack(localOrderId);
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
            placeholder="Enter Order Number (e.g. AMB-2026-...)" 
            className="w-full p-6 bg-white border border-[#1A1A1A]/5 shadow-xl outline-none focus:border-[#D4AF37] transition-all font-serif text-lg text-center uppercase"
            value={localOrderId}
            onChange={(e) => setLocalOrderId(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!localOrderId || isSearching}
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
                {trackingInfo.timeline.map((item: TimelineItem, idx: number) => (
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
