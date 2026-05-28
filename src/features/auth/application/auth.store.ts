import { create } from 'zustand';
import api from '@/core/api/axios.instance';
import { TokenStorage } from '@/core/storage/token.storage';
import { User, LoginResponse } from '@/features/auth/domain/auth.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasAdmin: boolean | null;
  checkAdminStatus: () => Promise<void>;
  isInitializing: boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  hasAdmin: null,
  isInitializing: true,

  checkAdminStatus: async () => {
    try {
      const response = await api.get('/users/admin-status');
      set({ hasAdmin: response.data.hasAdmin });
    } catch (error) {
      set({ hasAdmin: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', credentials);

      await TokenStorage.setToken(data.token);
      set({ user: data.user, isAuthenticated: true });
    } catch (error) {
      throw error;
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