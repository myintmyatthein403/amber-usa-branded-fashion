"use client";

import { useStore } from "@/store/useStore";
import { useState } from "react";
import { Info } from "lucide-react";

interface PriceProps {
  amount: number | string;
  isUsdPrice?: boolean;
  className?: string;
  showRateHint?: boolean;
}

function formatRateDate(iso: string | null, locale: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString(locale === "my" ? "my-MM" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return null;
  }
}

export default function Price({
  amount,
  isUsdPrice = true,
  className,
  showRateHint = false,
}: PriceProps) {
  const [mounted] = useState(typeof window !== "undefined");
  const formatPrice = useStore((state) => state.formatPrice);
  const currency = useStore((state) => state.currency);
  const exchangeRate = useStore((state) => state.exchangeRate);
  const rateUpdatedAt = useStore((state) => state.rateUpdatedAt);
  const lockedRateNote = useStore((state) => state.lockedRateNote);
  const locale = useStore((state) => state.locale);

  if (!mounted) {
    return <span className={className}>...</span>;
  }

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (numAmount === null || numAmount === undefined || isNaN(numAmount)) {
    return <span className={className}>—</span>;
  }

  const safeIsUsdPrice = isUsdPrice === null ? true : isUsdPrice;
  const freshness = formatRateDate(rateUpdatedAt, locale);

  return (
    <span className={`inline-flex items-center gap-1 ${className ?? ""}`}>
      <span>{formatPrice(numAmount, safeIsUsdPrice)}</span>
      {showRateHint && (freshness || lockedRateNote) && (
        <span
          className="inline-flex text-[#1A1A1A]/30 hover:text-[#D4AF37] cursor-help"
          title={
            [
              freshness ? `Rate updated: ${freshness}` : null,
              lockedRateNote,
            ]
              .filter(Boolean)
              .join(" · ")
          }
        >
          <Info className="w-3 h-3" />
        </span>
      )}
    </span>
  );
}
