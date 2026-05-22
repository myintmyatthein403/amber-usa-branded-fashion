"use client";

import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { Product } from "@amber/shared";

interface FormattedProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  isUsdPrice: boolean;
  image: string;
  sizes: string[];
  onSale?: boolean;
  shortDescription?: string | null;
  variants?: any[];
}

export function useQuickBuyActions() {
  const [product, setProduct] = useState<FormattedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const addToCart = useStore((state) => state.addToCart);
  const market = useStore((state) => state.market);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?market=${market}&isFeatured=true`);
        const result = await res.json();
        const data = result?.data || result || [];
        if (data.length > 0) {
          const p = data[0] as Product;
          setProduct({
            id: p.id || '',
            name: p.name,
            price: parseFloat(String(p.price)),
            originalPrice: p.compareAtPrice ? parseFloat(String(p.compareAtPrice)) : null,
            isUsdPrice: p.isUsdPrice !== false,
            image: p.images?.[0] || "https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?auto=format&fit=crop&q=80&w=800",
            sizes: Array.from(new Set(p.variants?.map((v) => v.size) || [])),
            variants: p.variants
          });
        }
      } catch (error) {
        console.error("Failed to fetch featured product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [market]);

  const activeImage = useMemo(() => {
    if (!product) return "";
    if (selectedSize) {
      const variant = product.variants?.find((v) => v.size === selectedSize);
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
    
    const selectedVariant = product.variants?.find((v) => v.size === selectedSize);
    
    addToCart(
      product as any, 
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