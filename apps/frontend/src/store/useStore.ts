import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@amber/shared";

export type Market = "US" | "MM";
export type Locale = "en" | "my";

export interface CartItem {
  id: string;
  name: string;
  category?: string;
  variantId?: string;
  price: number;
  originalPrice?: number;
  isUsdPrice?: boolean;
  currencyCode?: string;
  onSale?: boolean;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  isPreOrder?: boolean;
  expectedShippingDate?: string;
}

function cartItemMatches(
  item: CartItem,
  productId: string,
  variantId?: string,
  size?: string,
  color?: string,
) {
  if (variantId) return item.variantId === variantId;
  return item.id === productId && item.size === size && item.color === color;
}

interface AppState {
  cartItems: CartItem[];
  isCartOpen: boolean;
  isCartAnimating: boolean;
  addToCart: (
    product: Product,
    size?: string,
    variantId?: string,
    isPreOrder?: boolean,
    expectedShippingDate?: string,
    color?: string,
    price?: number,
    image?: string,
    currencyCode?: string,
  ) => boolean;
  removeFromCart: (id: string, size?: string, variantId?: string) => void;
  updateQuantity: (
    id: string,
    size: string | undefined,
    delta: number,
    variantId?: string,
  ) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;

  currency: "USD" | "MMK";
  exchangeRate: number;
  rateUpdatedAt: string | null;
  lockedRateNote: string;
  setCurrency: (currency: "USD" | "MMK") => void;
  setExchangeRate: (rate: number) => void;
  setRateMeta: (meta: { rateUpdatedAt?: string | null; lockedRateNote?: string }) => void;
  formatPrice: (price: number, isUsdPrice?: boolean) => string;
  convertPrice: (price: number, fromUsd: boolean) => number;

  market: Market;
  setMarket: (market: Market) => void;

  locale: Locale;
  setLocale: (locale: Locale) => void;

  liteMode: boolean;
  setLiteMode: (enabled: boolean) => void;

  compareList: Product[];
  isCompareDrawerOpen: boolean;
  isCompareModalOpen: boolean;
  addToCompare: (product: Product) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  setCompareDrawerOpen: (open: boolean) => void;
  setCompareModalOpen: (open: boolean) => void;

  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  selectedQuickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;

  getCartCount: () => number;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      isCartOpen: false,
      isCartAnimating: false,
      setCartOpen: (open) => set({ isCartOpen: open }),

      addToCart: (
        product,
        size,
        variantId,
        isPreOrder,
        expectedShippingDate,
        color,
        price,
        image,
        currencyCode,
      ) => {
        const hasVariants = Boolean(product.variants && product.variants.length > 0);
        if (hasVariants && !variantId) {
          return false;
        }

        const cartItems = get().cartItems;
        const productId = product.id!;
        const existingItem = cartItems.find((item) =>
          cartItemMatches(item, productId, variantId, size, color),
        );

        const resolvedCurrency =
          currencyCode ||
          (product as { currencyCode?: string }).currencyCode ||
          (product.isUsdPrice !== false ? "USD" : "MMK");

        let newItems: CartItem[];
        if (existingItem) {
          newItems = cartItems.map((item) =>
            cartItemMatches(item, productId, variantId, size, color)
              ? { ...item, quantity: item.quantity + 1, isPreOrder, expectedShippingDate }
              : item,
          );
        } else {
          const cartItem: CartItem = {
            id: productId,
            name: product.name,
            category: product.category?.name,
            quantity: 1,
            size,
            variantId,
            isPreOrder,
            expectedShippingDate,
            color: color || (product as { color?: string }).color,
            price: price !== undefined ? price : Number(product.price),
            image: image || product.images[0],
            isUsdPrice: product.isUsdPrice,
            currencyCode: resolvedCurrency,
            onSale: product.onSale || (product as { onSale?: boolean }).onSale,
          };
          newItems = [...cartItems, cartItem];
        }

        set({
          cartItems: newItems,
          isCartAnimating: true,
          isCartOpen: true,
        });
        setTimeout(() => set({ isCartAnimating: false }), 1000);
        return true;
      },

      removeFromCart: (id, size, variantId) => {
        set({
          cartItems: get().cartItems.filter(
            (item) => !cartItemMatches(item, id, variantId, size),
          ),
        });
      },

      updateQuantity: (id, size, delta, variantId) => {
        set({
          cartItems: get().cartItems.map((item) => {
            const matches = variantId
              ? item.variantId === variantId
              : item.id === id && item.size === size;
            if (matches) {
              return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
          }),
        });
      },

      clearCart: () => set({ cartItems: [] }),

      compareList: [],
      isCompareDrawerOpen: false,
      isCompareModalOpen: false,
      setCompareDrawerOpen: (open) => set({ isCompareDrawerOpen: open }),
      setCompareModalOpen: (open) => set({ isCompareModalOpen: open }),
      addToCompare: (product) => {
        const compareList = get().compareList;
        if (compareList.length >= 4) {
          alert("You can compare up to 4 products at once.");
          return;
        }
        if (compareList.find((p) => p.id === product.id)) {
          set({ isCompareDrawerOpen: true });
          return;
        }
        set({
          compareList: [...compareList, product],
          isCompareDrawerOpen: true,
        });
      },
      removeFromCompare: (id) => {
        set({
          compareList: get().compareList.filter((p) => p.id !== id),
        });
      },
      clearCompare: () => set({ compareList: [] }),

      isSearchOpen: false,
      setSearchOpen: (open) => set({ isSearchOpen: open }),
      selectedQuickViewProduct: null,
      setQuickViewProduct: (product) => set({ selectedQuickViewProduct: product }),

      currency: "USD",
      exchangeRate: 3500,
      rateUpdatedAt: null,
      lockedRateNote: "Exchange rate is locked at checkout",
      setCurrency: (currency) => set({ currency }),
      setExchangeRate: (rate) => set({ exchangeRate: rate }),
      setRateMeta: (meta) =>
        set({
          ...(meta.rateUpdatedAt !== undefined && { rateUpdatedAt: meta.rateUpdatedAt }),
          ...(meta.lockedRateNote !== undefined && { lockedRateNote: meta.lockedRateNote }),
        }),

      market: "MM",
      setMarket: (market) => {
        set({ market });
        if (market === "US") {
          set({ currency: "USD" });
        } else {
          set({ currency: "MMK" });
        }
      },

      locale: "en",
      setLocale: (locale) => set({ locale }),

      liteMode: false,
      setLiteMode: (enabled) => set({ liteMode: enabled }),

      convertPrice: (price, fromUsd) => {
        const { currency, exchangeRate } = get();
        if (fromUsd) {
          return currency === "USD" ? price : price * exchangeRate;
        }
        return currency === "MMK" ? price : price / exchangeRate;
      },

      formatPrice: (price, isUsdPrice = true) => {
        const { currency, exchangeRate } = get();
        let targetPrice = price;
        const safeIsUsdPrice = isUsdPrice === null ? true : isUsdPrice;

        if (safeIsUsdPrice && currency === "MMK") {
          targetPrice = price * exchangeRate;
        } else if (!safeIsUsdPrice && currency === "USD") {
          targetPrice = price / exchangeRate;
        }

        if (currency === "USD") {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(targetPrice);
        }
        return (
          new Intl.NumberFormat("my-MM", { style: "decimal" }).format(Math.round(targetPrice)) +
          " MMK"
        );
      },

      getCartCount: () => get().cartItems.reduce((acc, item) => acc + item.quantity, 0),
      getSubtotal: () => {
        const { cartItems, currency, exchangeRate } = get();
        return cartItems.reduce((acc, item) => {
          const itemPrice = item.price;
          const itemIsUsd =
            item.currencyCode === "USD" || (item.isUsdPrice !== false && !item.currencyCode);

          let convertedPrice = itemPrice;
          if (itemIsUsd && currency === "MMK") {
            convertedPrice = itemPrice * exchangeRate;
          } else if (!itemIsUsd && currency === "USD") {
            convertedPrice = itemPrice / exchangeRate;
          }
          return acc + convertedPrice * item.quantity;
        }, 0);
      },
      getDeliveryFee: () => {
        const { cartItems, currency, exchangeRate, market } = get();
        const hasPhysicalItems = cartItems.some(
          (item) => item.category !== "Gift Card" && item.size !== "Digital",
        );
        if (!hasPhysicalItems || cartItems.length === 0) return 0;

        const baseMmk = market === "US" ? 0 : 3000;
        return currency === "MMK" ? baseMmk : baseMmk / exchangeRate;
      },
      getTotal: () => get().getSubtotal() + get().getDeliveryFee(),
    }),
    {
      name: "amber-premium-storage",
      partialize: (state) => ({
        cartItems: state.cartItems,
        compareList: state.compareList,
        currency: state.currency,
        exchangeRate: state.exchangeRate,
        rateUpdatedAt: state.rateUpdatedAt,
        market: state.market,
        locale: state.locale,
        liteMode: state.liteMode,
      }),
    },
  ),
);
