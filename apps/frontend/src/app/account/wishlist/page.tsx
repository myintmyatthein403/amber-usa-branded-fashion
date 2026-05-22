"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuthStore } from "@/store/useAuthStore";
import { getApiUrl } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

interface WishlistEntry {
  id: string;
  productId: string;
  variantId?: string;
  product?: {
    id: string;
    name: string;
    images?: string[];
    price?: number;
  };
}

export default function WishlistPage() {
  const router = useRouter();
  const { token, isAuthenticated, hasHydrated } = useAuthStore();
  const [items, setItems] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${getApiUrl()}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : data.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.push("/login?redirect=/account/wishlist");
      return;
    }
    fetchWishlist();
  }, [hasHydrated, isAuthenticated, router, fetchWishlist]);

  const handleRemove = async (id: string) => {
    if (!token) return;
    await fetch(`${getApiUrl()}/wishlist/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchWishlist();
  };

  if (!hasHydrated || (!isAuthenticated && hasHydrated)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[#1A1A1A]/40">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-32 space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif">Wishlist</h1>
          <Link href="/profile" className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
            Back to profile
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-[#1A1A1A]/50 italic">No saved items yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {items.map((item) => (
              <li key={item.id} className="border border-[#1A1A1A]/10 bg-white p-4 space-y-3">
                {item.product?.images?.[0] && (
                  <div className="relative aspect-[3/4] bg-[#F5F0E1]">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <p className="font-serif text-sm">{item.product?.name || "Product"}</p>
                <div className="flex gap-3">
                  <Link
                    href={`/shop/${item.productId}`}
                    className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="text-[10px] font-bold uppercase tracking-widest text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
