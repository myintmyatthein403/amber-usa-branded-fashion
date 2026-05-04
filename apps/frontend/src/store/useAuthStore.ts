import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order } from '@amber/shared';

interface User {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  role: string;
  phone: string | null;
  address: string | null;
  avatar: string | null;
  points: number;
  memberLevel: string;
  orders?: Order[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
  setLoggingOut: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoggingOut: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true, isLoggingOut: false }),
      updateUser: (user) => set({ user }),
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      setLoggingOut: (val) => set({ isLoggingOut: val }),
    }),
    {
      name: 'amber-auth-storage',
    }
  )
);
