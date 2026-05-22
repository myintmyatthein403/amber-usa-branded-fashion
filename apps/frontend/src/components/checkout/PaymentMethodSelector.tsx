"use client";

import { PaymentMethod } from "./index";
import { cn } from "@/lib/utils";

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  loading: boolean;
  selectedName: string;
  onSelect: (name: string, type: "MANUAL" | "STRIPE") => void;
}

export default function PaymentMethodSelector({
  methods,
  loading,
  selectedName,
  onSelect,
}: PaymentMethodSelectorProps) {
  return (
    <>
      <h3 className="text-xl font-serif">Payment Method</h3>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground animate-pulse uppercase tracking-widest text-[10px] font-bold">
          Initializing Secure Checkout...
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {methods.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelect(p.name, p.type)}
              className={cn(
                "p-8 border flex flex-col items-center justify-center space-y-4 cursor-pointer transition-all text-center",
                selectedName === p.name
                  ? "border-[#D4AF37] bg-[#F5F0E1]/30"
                  : "border-[#1A1A1A]/5 hover:border-[#1A1A1A]/20"
              )}
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-[#D4AF37] shadow-sm uppercase text-xs">
                {p.name.substring(0, 1)}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}