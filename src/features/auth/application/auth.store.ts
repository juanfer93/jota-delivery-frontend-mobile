// src/features/auth/application/auth.store.ts
import { create } from 'zustand';
import api from '@/core/api/axios.instance';
import { TokenStorage } from '@/core/storage/token.storage';
import { User, LoginResponse, SetPasswordDTO } from '../domain/auth.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasAdmin: boolean | null;
  checkAdminStatus: () => Promise<boolean>;
  isInitializing: boolean;

  isSettingPassword: boolean;
  setPasswordMessage: string | null;
  setPasswordError: string | null;
  setPassword: (data: SetPasswordDTO) => Promise<boolean>;
  clearPasswordMessages: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  hasAdmin: null,
  isInitializing: true,

  checkAdminStatus: async () => {
    console.log("🔍 [STORE] checkAdminStatus INICIANDO"); 
    try {
      const response = await api.get('/users/admin-status');
      const hasAdmin = response.data.data?.hasAdmin ?? false;
      console.log("🔍 [STORE] Respuesta API:", hasAdmin);
      set({ hasAdmin });
      return hasAdmin;
    } catch (error: any) {
      console.error("❌ [STORE] Error en checkAdminStatus:", error?.message || error);
      set({ hasAdmin: false }); 
      return false;
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', credentials);
      console.log('🔐 [LOGIN] Respuesta del backend:', data);
      
      await TokenStorage.setToken(data.accessToken);
      console.log('🔐 [LOGIN] Token guardado:', data.accessToken);
      
      // Verificar que se guardó correctamente
      const savedToken = await TokenStorage.getToken();
      console.log('🔐 [LOGIN] Token recuperado del storage:', savedToken);
      
      set({ user: data.usuario, isAuthenticated: true });
      console.log('🔐 [LOGIN] Estado actualizado:', { user: data.usuario, isAuthenticated: true });
    } catch (error) {
      console.error('❌ [LOGIN] Error:', error);
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
    console.log('🔐 [AUTH] checkAuth INICIANDO...');
    const token = await TokenStorage.getToken();
    console.log('🔐 [AUTH] Token encontrado:', token ? 'SÍ (' + token.substring(0, 10) + '...)' : 'NO');
    
    if (!token) {
      console.log('❌ [AUTH] No hay token, usuario NO autenticado');
      set({ isAuthenticated: false, user: null });
      return;
    }
    
    set({ isAuthenticated: true });
    console.log('✅ [AUTH] Usuario autenticado');
  },

  isSettingPassword: false,
  setPasswordMessage: null,
  setPasswordError: null,

  clearPasswordMessages: () => {
    set({ setPasswordMessage: null, setPasswordError: null });
  },

  setPassword: async (data) => {
    set({ isSettingPassword: true, setPasswordMessage: null, setPasswordError: null });
    
    try {
      await api.post('/auth/domiciliarios/set-password', data);
      set({ setPasswordMessage: 'Contraseña creada correctamente. Ya puedes iniciar sesión.' });
      return true;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'No se pudo crear la contraseña. El enlace puede haber expirado.';
      set({ setPasswordError: message });
      return false;
    } finally {
      set({ isSettingPassword: false });
    }
  },
}));