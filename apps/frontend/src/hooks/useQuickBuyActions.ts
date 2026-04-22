"use client";

import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/store/useStore";

export function useQuickBuyActions() {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const addToCart = useStore((state) => state.addToCart);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?isFeatured=true`);
        const data = await res.json();
        if (data.length > 0) {
          const p = data[0];
          setProduct({
            ...p,
            price: parseFloat(p.price),
            originalPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice) : null,
            isUsdPrice: p.isUsdPrice !== false,
            image: p.images?.[0] || "https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?auto=format&fit=crop&q=80&w=800",
            sizes: Array.from(new Set(p.variants?.map((v: any) => v.size) || []))
          });
        }
      } catch (error) {
        console.error("Failed to fetch featured product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const activeImage = useMemo(() => {
    if (!product) return "";
    if (selectedSize) {
      const variant = product.variants?.find((v: any) => v.size === selectedSize);
      if (variant?.images && variant.images.length > 0) {
        return variant.images[0];
      }
    }
    return product.image;
  }, [product, selectedSize]);

  const handleQuickAdd = () => {
    if (!product) return;
    if (!selectedSize && product.sizes?.length > 0) {
      alert("Please select a size");
      return;
    }
    setIsAdding(true);
    
    const selectedVariant = product.variants?.find((v: any) => v.size === selectedSize);
    
    addToCart(
      product, 
      selectedSize || undefined, 
      selectedVariant?.id,
      undefined,
      undefined,
      undefined,
      selectedVariant?.price ? Number(selectedVariant.price) : undefined,
      selectedVariant?.images?.[0] || undefined
    );
    setTimeout(() => setIsAdding(false), 1000);
  };

  return {
    product,
    loading,
    selectedSize,
    setSelectedSize,
    isAdding,
    activeImage,
    handleQuickAdd
  };
}
