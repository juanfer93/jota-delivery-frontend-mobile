import { create } from 'zustand';
import api from '@/core/api/axios.instance';
import { TokenStorage } from '@/core/storage/token.storage';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', credentials);
      await TokenStorage.setToken(data.token);
      set({ user: data.user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await TokenStorage.removeToken();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = await TokenStorage.getToken();
    if (!token) return;
    
    set({ isAuthenticated: true });
  }
}));