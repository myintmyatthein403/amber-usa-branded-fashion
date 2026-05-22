"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { getApiUrl } from "@/lib/api";

function StoreInitializer() {
  const setExchangeRate = useStore((state) => state.setExchangeRate);
  const setRateMeta = useStore((state) => state.setRateMeta);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/settings`, { cache: 'no-store' });
        const data = await res.json();
        const settings = data.data || data;
        if (settings.usdToMmkRate) {
          setExchangeRate(Number(settings.usdToMmkRate));
          setRateMeta({
            rateUpdatedAt: settings.rateUpdatedAt,
            lockedRateNote: settings.isManualOverride 
              ? "Manual exchange rate applied" 
              : "Live market rate applied",
          });
        }
      } catch (error) {
        console.error("Failed to fetch settings/rates:", error);
      }
    };
    fetchSettings();
  }, [setExchangeRate, setRateMeta]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <StoreInitializer />
      {children}
    </SessionProvider>
  );
}
