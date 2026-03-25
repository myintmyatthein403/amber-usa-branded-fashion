"use client";

import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export default function CurrencySwitcher() {
  const [mounted, setMounted] = useState(false);
  const currency = useStore((state) => state.currency);
  const setCurrency = useStore((state) => state.setCurrency);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative flex items-center bg-muted/50 p-1 border border-border/50 rounded-full h-9">
      <div className="flex relative w-full h-full">
        {/* Animated background pill */}
        <motion.div
          className="absolute h-full w-1/2 bg-background rounded-full shadow-sm border border-border/20"
          initial={false}
          animate={{
            x: currency === 'USD' ? '0%' : '100%',
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />

        <button
          onClick={() => setCurrency('USD')}
          className={cn(
            "relative z-10 w-16 h-full text-[9px] font-bold uppercase tracking-[0.2em] transition-colors duration-300",
            currency === 'USD' ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
          )}
        >
          USD
        </button>
        <button
          onClick={() => setCurrency('MMK')}
          className={cn(
            "relative z-10 w-16 h-full text-[9px] font-bold uppercase tracking-[0.2em] transition-colors duration-300",
            currency === 'MMK' ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
          )}
        >
          MMK
        </button>
      </div>
    </div>
  );
}
