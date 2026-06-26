import { create } from 'zustand';
import api from '@/core/api/axios.instance';
import { DeliveryRepository } from '@/core/repositories/delivery.repository';
import { TokenStorage } from '@/core/storage/token.storage';
import {
  User,
  RawLoginResponse,
  SetPasswordDTO,
  ChangePasswordDTO,
  isDomiciliarioRole,
} from '@/features/auth/domain/auth.types';

const USE_FAKE_API = process.env.JOTA_USE_FAKE_API === 'true';
const FORCE_REAL_BACKEND = process.env.JOTA_REAL_BACKEND === 'true';
const shouldMockBackend =
  USE_FAKE_API || (process.env.NODE_ENV === 'test' && !FORCE_REAL_BACKEND);

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
  changeProfilePassword: (data: ChangePasswordDTO) => Promise<boolean>;
  clearPasswordMessages: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  hasAdmin: null,
  isInitializing: true,

  checkAdminStatus: async () => {
    try {
      const response = await api.get('/users/admin-status');
      const hasAdmin = response.data.data?.hasAdmin ?? false;
      set({ hasAdmin });
      return hasAdmin;
    } catch (error: any) {
      console.error('❌ [STORE] Error en checkAdminStatus:', error?.message || error);
      set({ hasAdmin: false });
      return false;
    }
  },

  login: async (credentials: { email: string; password: string }) => {
    set({ isLoading: true });

    try {
      if (shouldMockBackend) {
        const fakeToken = 'test-token';
        await TokenStorage.setToken(fakeToken);

        set({
          user: {
            id: 'test',
            nombre: 'Test User',
            email: credentials.email,
            rol: 'admin',
          } as User,
          isAuthenticated: true,
        });

        return;
      }

      const response = await api.post<RawLoginResponse>('/auth/login', credentials);
      const loginData = response.data.data;

      if (!loginData?.accessToken) {
        throw new Error('No se recibió token del servidor');
      }

      await TokenStorage.setToken(loginData.accessToken);

      set({
        user: loginData.usuario as User,
        isAuthenticated: true,
      });
    } catch (error: any) {
      console.error('❌ [LOGIN] Error crítico:', error?.message || error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const currentUser = get().user;

    if (isDomiciliarioRole(currentUser?.rol) && currentUser?.id) {
      await DeliveryRepository.setCourierAvailability('offline').catch((error: unknown) => {
        console.error('[AUTH] No se pudo marcar el domiciliario como desconectado.', error);
      });
    }

    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    try {
      await TokenStorage.removeToken();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : error;
      console.error('❌ [AUTH] Error eliminando token en logout:', message);
    }
  },

  checkAuth: async () => {
    const token = await TokenStorage.getToken();

    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    try {
      const response = await api.get('/usuarios/perfil');
      const usuario = response.data.data?.usuario ?? response.data.data ?? null;

      if (usuario) {
        set({
          user: usuario as User,
          isAuthenticated: true,
        });
        return;
      }
    } catch (error: unknown) {
      console.warn('[AUTH] No se pudo obtener el perfil desde /usuarios/perfil.', error);
    }

    console.warn('⚠️ [AUTH] No se pudo validar el token. Limpiando sesión local.');
    await TokenStorage.removeToken();
    set({ isAuthenticated: false, user: null });
  },

  isSettingPassword: false,
  setPasswordMessage: null,
  setPasswordError: null,

  clearPasswordMessages: () => {
    set({
      setPasswordMessage: null,
      setPasswordError: null,
    });
  },

  setPassword: async (data: SetPasswordDTO) => {
    set({
      isSettingPassword: true,
      setPasswordMessage: null,
      setPasswordError: null,
    });

    try {
      await api.post('/auth/domiciliarios/set-password', data);

      set({
        setPasswordMessage: 'Contraseña creada correctamente. Ya puedes iniciar sesión.',
      });

      return true;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'No se pudo crear la contraseña. El enlace puede haber expirado.';

      set({ setPasswordError: message });

      return false;
    } finally {
      set({ isSettingPassword: false });
    }
  },

  changeProfilePassword: async (data: ChangePasswordDTO) => {
    set({
      isSettingPassword: true,
      setPasswordMessage: null,
      setPasswordError: null,
    });

    try {
      await api.patch('/usuarios/perfil/password', data);

      set({
        setPasswordMessage: 'Contraseña actualizada correctamente.',
      });

      return true;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'No se pudo actualizar la contraseña. Intenta de nuevo.';

      set({ setPasswordError: message });

      return false;
    } finally {
      set({ isSettingPassword: false });
    }
  },
}));
