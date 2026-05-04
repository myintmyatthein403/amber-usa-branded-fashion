"use client";

import { useStore } from "@/store/useStore";
import { useState } from "react";

export function useCartActions() {
  const [mounted] = useState(typeof window !== 'undefined');
  
  const cartItems = useStore((state) => state.cartItems);
  const isCartOpen = useStore((state) => state.isCartOpen);
  const setCartOpen = useStore((state) => state.setCartOpen);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const updateQuantity = useStore((state) => state.updateQuantity);
  const subtotal = useStore((state) => state.getSubtotal());
  const deliveryFee = useStore((state) => state.getDeliveryFee());
  const total = useStore((state) => state.getTotal());
  const formatPrice = useStore((state) => state.formatPrice);
  const currency = useStore((state) => state.currency);

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const isUsd = currency === 'USD';

  const closeCart = () => setCartOpen(false);
  const openCart = () => setCartOpen(true);
  
  const removeItem = (id: string, size?: string, variantId?: string) => {
    removeFromCart(id, size, variantId);
  };

  const changeQuantity = (id: string, size: string | undefined, delta: number, variantId?: string) => {
    updateQuantity(id, size, delta, variantId);
  };

  const formattedSubtotal = formatPrice(subtotal, isUsd);
  const formattedDeliveryFee = formatPrice(deliveryFee, isUsd);
  const formattedTotal = formatPrice(total, isUsd);

  return {
    mounted,
    cartItems,
    isCartOpen,
    itemCount,
    formattedSubtotal,
    formattedDeliveryFee,
    formattedTotal,
    currency,
    isUsd,
    closeCart,
    openCart,
    removeItem,
    changeQuantity,
    formatPrice
  };
}
