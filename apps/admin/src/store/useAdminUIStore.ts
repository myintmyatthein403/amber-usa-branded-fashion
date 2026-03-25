import { create } from 'zustand';

interface AdminUIState {
  isSidebarOpen: boolean;
  activeTab: 'dashboard' | 'products' | 'categories' | 'brands' | 'variants' | 'hero' | 'mission' | 'gift-card-section' | 'sale-section' | 'footer-section' | 'testimonials' | 'community-posts' | 'collections' | 'coupons' | 'gift-cards' | 'sales' | 'reviews' | 'orders' | 'customers' | 'staff' | 'roles' | 'settings' | 'delivery-methods' | 'ads' | 'warehouses' | 'cargo' | 'inventory' | 'media';
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  pendingOrdersCount: number;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  setActiveTab: (tab: AdminUIState['activeTab']) => void;
  setAuth: (user: any, token: string) => void;
  updateUser: (user: any) => void;
  setPendingOrdersCount: (count: number) => void;
  logout: () => void;
}

export const useAdminUIStore = create<AdminUIState>((set) => ({
  isSidebarOpen: true,
  activeTab: (localStorage.getItem('admin-active-tab') as AdminUIState['activeTab']) || 'dashboard',
  user: JSON.parse(localStorage.getItem('admin-user') || 'null'),
  token: localStorage.getItem('admin-token'),
  isAuthenticated: !!localStorage.getItem('admin-token'),
  pendingOrdersCount: 0,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  openSidebar: () => set({ isSidebarOpen: true }),
  setActiveTab: (tab) => {
    localStorage.setItem('admin-active-tab', tab);
    set({ activeTab: tab });
  },
  setAuth: (user, token) => {
    localStorage.setItem('admin-user', JSON.stringify(user));
    localStorage.setItem('admin-token', token);
    set({ user, token, isAuthenticated: true });
  },
  updateUser: (user) => {
    localStorage.setItem('admin-user', JSON.stringify(user));
    set({ user });
  },
  setPendingOrdersCount: (count) => set({ pendingOrdersCount: count }),
  logout: () => {
    localStorage.removeItem('admin-user');
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-active-tab');
    localStorage.removeItem('admin-theme'); // Clean up old theme preference
    set({ user: null, token: null, isAuthenticated: false, activeTab: 'dashboard', pendingOrdersCount: 0 });
  },
}));
