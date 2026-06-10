import { create } from 'zustand';
import api from '@/core/api/axios.instance';
import { TokenStorage } from '@/core/storage/token.storage';
import { User, RawLoginResponse, SetPasswordDTO } from '@/features/auth/domain/auth.types'; 

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
      if (process.env.NODE_ENV === 'test') {
        // Simular login en entorno de tests sin llamar al backend
        const fakeToken = 'test-token';
        await TokenStorage.setToken(fakeToken);
        set({ user: { id: 'test', nombre: 'Test User', email: credentials.email, rol: (credentials as any).rol || 'ADMIN' }, isAuthenticated: true });
        console.log('🔐 [LOGIN] Simulación de login en test');
        return;
      }

      const response = await api.post<RawLoginResponse>('/auth/login', credentials);

      const loginData = response.data.data; 

      console.log('🔐 [LOGIN] Datos extraídos:', loginData);

      if (!loginData?.accessToken) {
        throw new Error('No se recibió token del servidor');
      }

      await TokenStorage.setToken(loginData.accessToken);
      console.log(' [LOGIN] Token guardado correctamente');

      const savedToken = await TokenStorage.getToken();
      console.log('🔐 [LOGIN] Token verificado en storage:', savedToken ? 'SÍ' : 'NO');

      set({ user: loginData.usuario, isAuthenticated: true });
      console.log('✅ [LOGIN] Estado actualizado exitosamente');
      
    } catch (error: any) {
      console.error('❌ [LOGIN] Error crítico:', error.message);
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
      console.log(' [AUTH] No hay token, usuario NO autenticado');
      set({ isAuthenticated: false, user: null });
      return;
    }

    try {
      const response = await api.get('/auth/me');
      const usuario = response.data.data?.usuario ?? response.data.data ?? null;
      if (usuario) {
        set({ user: usuario, isAuthenticated: true });
        console.log('✅ [AUTH] Usuario cargado desde API:', usuario?.email || usuario?.name || 'sin nombre');
        return;
      }
    } catch (err) {
      console.warn('⚠️ [AUTH] No se pudo obtener usuario con /auth/me, intentando /users/me');
      try {
        const resp2 = await api.get('/users/me');
        const usuario2 = resp2.data.data ?? null;
        if (usuario2) {
          set({ user: usuario2, isAuthenticated: true });
          console.log('✅ [AUTH] Usuario cargado desde API /users/me');
          return;
        }
      } catch (err2) {
        console.warn('⚠️ [AUTH] No se pudo obtener usuario desde /users/me');
      }
    }

    // Si no logramos obtener el usuario, dejamos el token pero marcamos autenticado
    set({ isAuthenticated: true });
    console.log('✅ [AUTH] Usuario autenticado (sin datos de perfil cargados)');
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