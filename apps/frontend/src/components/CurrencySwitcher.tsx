"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useTranslations } from "@/i18n/useTranslations";

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

export default function CurrencySwitcher({ compact }: { compact?: boolean }) {
  const [isClient, setIsClient] = useState(false);
  const currency = useStore((state) => state.currency);
  const setCurrency = useStore((state) => state.setCurrency);
  const rateUpdatedAt = useStore((state) => state.rateUpdatedAt);
  const lockedRateNote = useStore((state) => state.lockedRateNote);
  const locale = useStore((state) => state.locale);
  const t = useTranslations();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const freshness = formatRateDate(rateUpdatedAt, locale);
  const tooltip = [
    freshness ? `${t("currency.rateUpdated")}: ${freshness}` : null,
    lockedRateNote || t("currency.rateLocked"),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={cn("flex flex-col gap-1", compact && "items-end")}>
      <div className="relative flex items-center bg-muted/50 p-1 border border-border/50 rounded-full h-9">
        <div className="flex relative w-full h-full">
          {isClient && (
            <motion.div
              className="absolute h-full w-1/2 bg-background rounded-full shadow-sm border border-border/20"
              initial={false}
              animate={{ x: currency === "USD" ? "0%" : "100%" }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <button
            type="button"
            onClick={() => setCurrency("USD")}
            disabled={!isClient}
            className={cn(
              "relative z-10 w-16 h-full text-[9px] font-bold uppercase tracking-[0.2em] transition-colors duration-300",
              !isClient || currency === "USD"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/70",
            )}
          >
            USD
          </button>
          <button
            type="button"
            onClick={() => setCurrency("MMK")}
            disabled={!isClient}
            className={cn(
              "relative z-10 w-16 h-full text-[9px] font-bold uppercase tracking-[0.2em] transition-colors duration-300",
              !isClient || currency === "MMK"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/70",
            )}
          >
            MMK
          </button>
        </div>
      </div>
      {!compact && (
        <p
          className="text-[8px] text-[#1A1A1A]/40 flex items-center gap-1 max-w-[140px] leading-tight"
          title={tooltip}
        >
          <Info className="w-2.5 h-2.5 shrink-0" />
          <span className="truncate">
            {freshness ? `${t("currency.rateUpdated")} ${freshness}` : t("currency.rateLocked")}
          </span>
        </p>
      )}
    </div>
  );
}
