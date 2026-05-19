"use client";

import { useStore } from "@/store/useStore";
import { useState } from "react";

interface PriceProps {
  amount: number | string;
  isUsdPrice?: boolean;
  className?: string;
}

export default function Price({ amount, isUsdPrice = true, className }: PriceProps) {
  const [mounted] = useState(typeof window !== "undefined");
  const currency = useStore((state) => state.currency);
  const formatPrice = useStore((state) => state.formatPrice);
  
  if (!mounted) {
    return <span className={className}>...</span>;
  }

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (numAmount === null || numAmount === undefined || isNaN(numAmount)) {
    return <span className={className}>—</span>;
  }

  const safeIsUsdPrice = isUsdPrice === null ? true : isUsdPrice;

  return (
    <span className={className}>
      {formatPrice(numAmount, safeIsUsdPrice)}
    </span>
  );
}
