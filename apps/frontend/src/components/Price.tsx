"use client";

import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";

interface PriceProps {
  amount: number | string;
  isUsdPrice?: boolean;
  className?: string;
}

export default function Price({ amount, isUsdPrice = true, className }: PriceProps) {
  const [mounted, setMounted] = useState(false);
  const currency = useStore((state) => state.currency);
  const formatPrice = useStore((state) => state.formatPrice);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Fallback during hydration to avoid mismatch
    return <span className={className}>...</span>;
  }

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  const safeIsUsdPrice = isUsdPrice === null ? true : isUsdPrice;

  return (
    <span className={className}>
      {formatPrice(numAmount, safeIsUsdPrice)}
    </span>
  );
}
