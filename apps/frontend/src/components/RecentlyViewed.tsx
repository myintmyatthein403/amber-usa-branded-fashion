"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { getApiUrl } from "@/lib/api";
import Price from "@/components/Price";

interface RecentlyViewedProduct {
  id: string;
  slug?: string;
  name: string;
  price: number | string;
  isUsdPrice?: boolean;
  images: string[];
}

export default function RecentlyViewed({ excludeProductId }: { excludeProductId?: string }) {
  const recentlyViewed = useStore((state) => state.recentlyViewed);
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([]);

  const ids = recentlyViewed.filter((id) => id !== excludeProductId).slice(0, 8);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      return;
    }
    let cancelled = false;
    fetch(`${getApiUrl()}/products?ids=${ids.join(",")}`)
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return;
        const data: RecentlyViewedProduct[] = result?.data ?? result ?? [];
        // Preserve most-recently-viewed-first order — the API doesn't
        // guarantee it matches the `ids` param order.
        const byId = new Map(data.map((p) => [p.id, p]));
        setProducts(ids.map((id) => byId.get(id)).filter((p): p is RecentlyViewedProduct => !!p));
      })
      .catch(() => setProducts([]));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);

  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
      <h2 className="text-3xl font-serif text-center mb-12">Recently Viewed</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {products.map((p) => (
          <Link key={p.id} href={`/shop/${p.slug || p.id}`} className="group space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F0E1]/30">
              {p.images?.[0] && (
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-serif text-[#1A1A1A] truncate">{p.name}</h3>
              <Price amount={p.price} isUsdPrice={p.isUsdPrice} className="text-sm font-bold text-[#1A1A1A]" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
