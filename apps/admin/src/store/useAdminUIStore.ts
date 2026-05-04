import { create } from 'zustand';
import { User } from '@amber/shared';

interface AdminUIState {
  isSidebarOpen: boolean;
  activeTab: 'dashboard' | 'products' | 'categories' | 'brands' | 'variants' | 'hero' | 'mission' | 'gift-card-section' | 'sale-section' | 'footer-section' | 'testimonials' | 'community-posts' | 'collections' | 'coupons' | 'gift-cards' | 'sales' | 'reviews' | 'orders' | 'customers' | 'staff' | 'roles' | 'settings' | 'delivery-methods' | 'ads' | 'warehouses' | 'cargo' | 'inventory' | 'media';
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  pendingOrdersCount: number;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  setActiveTab: (tab: AdminUIState['activeTab']) => void;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: User) => void;
  setPendingOrdersCount: (count: number) => void;
  logout: () => void;
}

export const useAdminUIStore = create<AdminUIState>((set) => {
  let initialUser = null;
  try {
    const storedUser = localStorage.getItem('admin-user');
    if (storedUser) {
      initialUser = JSON.parse(storedUser);
      // Ensure 'role' is present if 'roleName' exists (compatibility check)
      if (initialUser && !initialUser.role && initialUser.roleName) {
        initialUser.role = initialUser.roleName;
      }
    }
  } catch (e) {
    console.error('Failed to parse admin user from localStorage', e);
  }

  return {
    isSidebarOpen: true,
    activeTab: (localStorage.getItem('admin-active-tab') as AdminUIState['activeTab']) || 'dashboard',
    user: initialUser,
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
      const userToStore = { ...user };
      if (!userToStore.role && userToStore.roleName) {
        userToStore.role = userToStore.roleName;
      }
      localStorage.setItem('admin-user', JSON.stringify(userToStore));
      localStorage.setItem('admin-token', token);
      set({ user: userToStore, token, isAuthenticated: true });
    },
    updateUser: (user) => {
      const userToStore = { ...user };
      if (!userToStore.role && userToStore.roleName) {
        userToStore.role = userToStore.roleName;
      }
      localStorage.setItem('admin-user', JSON.stringify(userToStore));
      set({ user: userToStore });
    },
    setPendingOrdersCount: (count) => set({ pendingOrdersCount: count }),
    logout: () => {
      localStorage.removeItem('admin-user');
      localStorage.removeItem('admin-token');
      localStorage.removeItem('admin-active-tab');
      localStorage.removeItem('admin-theme');
      set({ user: null, token: null, isAuthenticated: false, activeTab: 'dashboard', pendingOrdersCount: 0 });
    },
  };
});
