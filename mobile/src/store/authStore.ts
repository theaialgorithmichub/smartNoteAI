import { create } from 'zustand';

interface AuthState {
  token: string | null;
  userId: string | null;
  user: {
    _id?: string;
    clerkId?: string;
    email?: string;
    name?: string;
    avatar?: string;
    isAdmin?: boolean;
  } | null;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  setUserId: (userId: string | null) => void;
  setUser: (user: AuthState['user']) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  user: null,
  isLoading: false,
  setToken: (token) => set({ token }),
  setUserId: (userId) => set({ userId }),
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ token: null, userId: null, user: null }),
}));
