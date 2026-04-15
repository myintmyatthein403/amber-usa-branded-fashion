import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: number | string;
  name: string;
  category?: string;
  variantId?: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  onSale?: boolean;
  isUsdPrice?: boolean;
  isPreOrder?: boolean;
  expectedShippingDate?: string;
}

interface AppState {
  // Cart State
  cartItems: CartItem[];
  isCartOpen: boolean;
  isCartAnimating: boolean;
  addToCart: (product: any, size?: string, isPreOrder?: boolean, expectedShippingDate?: string) => void;
  removeFromCart: (id: number | string, size?: string) => void;
  updateQuantity: (id: number | string, size: string | undefined, delta: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;

  // Currency State
  currency: 'USD' | 'MMK';
  exchangeRate: number;
  setCurrency: (currency: 'USD' | 'MMK') => void;
  setExchangeRate: (rate: number) => void;
  formatPrice: (price: number, isUsdPrice?: boolean) => string;
  convertPrice: (price: number, fromUsd: boolean) => number;

  // Comparison State
  compareList: any[];
  isCompareDrawerOpen: boolean;
  isCompareModalOpen: boolean;
  addToCompare: (product: any) => void;
  removeFromCompare: (id: number | string) => void;
  clearCompare: () => void;
  setCompareDrawerOpen: (open: boolean) => void;
  setCompareModalOpen: (open: boolean) => void;

  // UI States
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  selectedQuickViewProduct: any | null;
  setQuickViewProduct: (product: any | null) => void;
  
  // Computed values (handled as functions or derived in components)
  getCartCount: () => number;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Cart
      cartItems: [],
      isCartOpen: false,
      isCartAnimating: false,
      setCartOpen: (open) => set({ isCartOpen: open }),
      addToCart: (product: any, size?: string, variantId?: string, isPreOrder?: boolean, expectedShippingDate?: string) => {
    const cartItems = get().cartItems;
    const existingItem = cartItems.find((item) => 
      item.id === product.id && 
      (variantId ? item.variantId === variantId : item.size === size)
    );
    
    let newItems;
    if (existingItem) {
      newItems = cartItems.map((item) =>
        item.id === product.id && (variantId ? item.variantId === variantId : item.size === size)
          ? { ...item, quantity: item.quantity + 1, isPreOrder, expectedShippingDate }
          : item
      );
    } else {
      newItems = [...cartItems, { ...product, quantity: 1, size, variantId, isPreOrder, expectedShippingDate }];
    }

    set({ 
      cartItems: newItems,
      isCartAnimating: true,
      isCartOpen: true
    });
    
    setTimeout(() => set({ isCartAnimating: false }), 1000);
  },
      removeFromCart: (id, size) => {
        set({
          cartItems: get().cartItems.filter((item) => !(item.id === id && item.size === size))
        });
      },
      updateQuantity: (id, size, delta) => {
        set({
          cartItems: get().cartItems.map((item) => {
            if (item.id === id && item.size === size) {
              return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
          })
        });
      },
      clearCart: () => set({ cartItems: [] }),

      // Comparison
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
        if (compareList.find(p => p.id === product.id)) {
          set({ isCompareDrawerOpen: true });
          return;
        }
        set({ 
          compareList: [...compareList, product],
          isCompareDrawerOpen: true 
        });
      },
      removeFromCompare: (id) => {
        set({
          compareList: get().compareList.filter(p => p.id !== id)
        });
      },
      clearCompare: () => set({ compareList: [] }),

      // UI
      isSearchOpen: false,
      setSearchOpen: (open) => set({ isSearchOpen: open }),
      selectedQuickViewProduct: null,
      setQuickViewProduct: (product) => set({ selectedQuickViewProduct: product }),

      // Currency
      currency: 'USD',
      exchangeRate: 3500,
      setCurrency: (currency) => set({ currency }),
      setExchangeRate: (rate) => set({ exchangeRate: rate }),
      convertPrice: (price, fromUsd) => {
        const { currency, exchangeRate } = get();
        if (fromUsd) {
          return currency === 'USD' ? price : price * exchangeRate;
        } else {
          return currency === 'MMK' ? price : price / exchangeRate;
        }
      },
      formatPrice: (price, isUsdPrice = true) => {
        const { currency, exchangeRate } = get();
        let targetPrice = price;
        const safeIsUsdPrice = isUsdPrice === null ? true : isUsdPrice;
        
        if (safeIsUsdPrice && currency === 'MMK') {
          targetPrice = price * exchangeRate;
        } else if (!safeIsUsdPrice && currency === 'USD') {
          targetPrice = price / exchangeRate;
        }

        if (currency === 'USD') {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(targetPrice);
        } else {
          return new Intl.NumberFormat('my-MM', {
            style: 'decimal',
          }).format(Math.round(targetPrice)) + ' MMK';
        }
      },

      // Helpers
      getCartCount: () => get().cartItems.reduce((acc, item) => acc + item.quantity, 0),
      getSubtotal: () => {
        const { cartItems, currency, exchangeRate } = get();
        return cartItems.reduce((acc, item) => {
          const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
          const itemIsUsd = item.isUsdPrice !== false; // Default to true if undefined

          let convertedPrice = itemPrice;
          if (itemIsUsd && currency === 'MMK') {
            convertedPrice = itemPrice * exchangeRate;
          } else if (!itemIsUsd && currency === 'USD') {
            convertedPrice = itemPrice / exchangeRate;
          }
          
          return acc + (convertedPrice * item.quantity);
        }, 0);
      },
      getDeliveryFee: () => {
        const { cartItems, currency, exchangeRate } = get();
        
        // If cart is empty or only contains gift cards/digital items, delivery is free
        const hasPhysicalItems = cartItems.some(item => item.category !== 'Gift Card' && item.size !== 'Digital');
        
        if (!hasPhysicalItems || cartItems.length === 0) {
          return 0;
        }

        const baseMmk = 3000;
        return currency === 'MMK' ? baseMmk : baseMmk / exchangeRate;
      },
      getTotal: () => {
        const subtotal = get().getSubtotal();
        const deliveryFee = get().getDeliveryFee();
        return subtotal + deliveryFee;
      },
    }),
    {
      name: "amber-premium-storage",
      partialize: (state) => ({ 
        cartItems: state.cartItems,
        compareList: state.compareList,
        currency: state.currency
      }),
    }
  )
);
