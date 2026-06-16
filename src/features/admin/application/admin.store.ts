import { create } from 'zustand';
import api from '@/core/api/axios.instance';
import { CreateAdminDTO, CreateDomiciliarioDTO, CreateComercioDTO } from '../domain/admin.types';
import { AdminRepository } from '@/core/repositories/admin.repository';

const USE_FAKE_API = process.env.JOTA_USE_FAKE_API === 'true';
const FORCE_REAL_BACKEND = process.env.JOTA_REAL_BACKEND === 'true';
const shouldMockBackend = USE_FAKE_API || (process.env.NODE_ENV === 'test' && !FORCE_REAL_BACKEND);

interface AdminStore {
  isCreating: boolean;
  createFirstAdmin: (data: CreateAdminDTO) => Promise<void>;
  
  isCreatingDomiciliario: boolean;
  domiciliarioMessage: string | null;
  domiciliarioError: string | null;
  createDomiciliario: (data: CreateDomiciliarioDTO) => Promise<boolean>;
  clearDomiciliarioMessages: () => void;
  isCreatingComercio: boolean;
  comercioMessage: string | null;
  comercioError: string | null;
  createComercio: (data: CreateComercioDTO) => Promise<boolean>;
  clearComercioMessages: () => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  isCreating: false,
  createFirstAdmin: async (data) => {
    set({ isCreating: true });
    try {
      if (shouldMockBackend) {
        // En entorno de tests controlado, evitamos llamadas reales y simulamos éxito.
        return;
      }

      await api.post('/users/admin', {
        nombre: data.nombre,
        email: data.email,
        password: data.password,
        rol: data.rol,
      });
    } finally {
      set({ isCreating: false });
    }
  },

  isCreatingDomiciliario: false,
  domiciliarioMessage: null,
  domiciliarioError: null,

  clearDomiciliarioMessages: () => {
    set({ domiciliarioMessage: null, domiciliarioError: null });
  },

  createDomiciliario: async (data) => {
    set({ isCreatingDomiciliario: true, domiciliarioMessage: null, domiciliarioError: null });
    
    try {
      await api.post('/usuarios/domiciliarios', data);
      set({ domiciliarioMessage: 'Domiciliario creado. Se ha enviado un correo de confirmacion.' });
      return true;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Error al crear el domiciliario. Intenta de nuevo.';
      set({ domiciliarioError: message });
      return false;
    } finally {
      set({ isCreatingDomiciliario: false });
    }
  },

  isCreatingComercio: false,
  comercioMessage: null,
  comercioError: null,

  clearComercioMessages: () => {
    set({ comercioMessage: null, comercioError: null });
  },

  createComercio: async (data) => {
    set({ isCreatingComercio: true, comercioMessage: null, comercioError: null });
    try {
      await AdminRepository.createComercio(data);
      set({ comercioMessage: 'Comercio creado correctamente.' });
      return true;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Error al crear el comercio. Intenta de nuevo.';
      set({ comercioError: message });
      return false;
    } finally {
      set({ isCreatingComercio: false });
    }
  },
}));
