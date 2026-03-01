import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  onSale?: boolean;
}

interface AppState {
  // Cart State
  cartItems: CartItem[];
  isCartOpen: boolean;
  isCartAnimating: boolean;
  addToCart: (product: any, size?: string) => void;
  removeFromCart: (id: number | string, size?: string) => void;
  updateQuantity: (id: number | string, size: string | undefined, delta: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;

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
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Cart
      cartItems: [],
      isCartOpen: false,
      isCartAnimating: false,
      setCartOpen: (open) => set({ isCartOpen: open }),
      addToCart: (product, size) => {
        const cartItems = get().cartItems;
        const existingItem = cartItems.find((item) => item.id === product.id && item.size === size);
        
        let newItems;
        if (existingItem) {
          newItems = cartItems.map((item) =>
            item.id === product.id && item.size === size
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          newItems = [...cartItems, { ...product, quantity: 1, size }];
        }

        set({ 
          cartItems: newItems,
          isCartAnimating: true 
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

      // Helpers
      getCartCount: () => get().cartItems.reduce((acc, item) => acc + item.quantity, 0),
      getSubtotal: () => get().cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
    }),
    {
      name: "amber-premium-storage",
      partialize: (state) => ({ 
        cartItems: state.cartItems,
        compareList: state.compareList 
      }),
    }
  )
);
