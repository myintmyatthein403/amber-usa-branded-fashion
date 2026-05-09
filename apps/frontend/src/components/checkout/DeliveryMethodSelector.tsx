"use client";

import { DeliveryMethod } from "./index";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

interface DeliveryMethodSelectorProps {
  methods: DeliveryMethod[];
  loading: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  subtotal: number;
  formatPrice: (amount: number, isUsd?: boolean) => string;
  onBack: () => void;
  onContinue: () => void;
}

export default function DeliveryMethodSelector({
  methods,
  loading,
  selectedId,
  onSelect,
  subtotal,
  formatPrice,
  onBack,
  onContinue,
}: DeliveryMethodSelectorProps) {
  return (
    <>
      <h3 className="text-xl font-serif">Shipping Method</h3>
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground animate-pulse uppercase tracking-widest text-[10px] font-bold">
            Syncing Logistics...
          </div>
        ) : (
          methods.map((method) => (
            <div
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={cn(
                "p-6 border flex items-center justify-between cursor-pointer transition-all",
                selectedId === method.id
                  ? "border-[#D4AF37] bg-[#F5F0E1]/30"
                  : "border-[#1A1A1A]/5 hover:border-[#1A1A1A]/20"
              )}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center",
                    selectedId === method.id
                      ? "border-[#D4AF37]"
                      : "border-[#1A1A1A]/20"
                  )}
                >
                  {selectedId === method.id && (
                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest">
                    {method.name}
                  </p>
                  <p className="text-[10px] text-[#1A1A1A]/40 uppercase font-bold">
                    {method.estimatedDays}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-[#D4AF37]">
                {method.freeOverAmount &&
                subtotal >= parseFloat(method.freeOverAmount)
                  ? "FREE"
                  : formatPrice(parseFloat(method.price), method.isUsdPrice)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="p-5 border border-[#1A1A1A]/10 hover:bg-zinc-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onContinue}
          className="flex-1 bg-[#1A1A1A] text-white py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#D4AF37] transition-all"
        >
          Continue to Payment
        </button>
      </div>
    </>
  );
}