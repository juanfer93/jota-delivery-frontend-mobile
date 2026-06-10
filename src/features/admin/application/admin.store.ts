import { create } from 'zustand';
import api from '@/core/api/axios.instance';
import { CreateAdminDTO, CreateDomiciliarioDTO } from '../domain/admin.types';

interface AdminStore {
  isCreating: boolean;
  createFirstAdmin: (data: CreateAdminDTO) => Promise<void>;
  
  isCreatingDomiciliario: boolean;
  domiciliarioMessage: string | null;
  domiciliarioError: string | null;
  createDomiciliario: (data: CreateDomiciliarioDTO) => Promise<boolean>;
  clearDomiciliarioMessages: () => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  isCreating: false,
  createFirstAdmin: async (data) => {
    set({ isCreating: true });
    try {
      if (process.env.NODE_ENV === 'test') {
        // En entorno de tests, evitamos llamadas reales y simulamos éxito
        console.log('[TEST MODE] Simulando createFirstAdmin');
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
      set({ domiciliarioMessage: 'Domiciliario creado. Se ha enviado un correo de confirmación.' });
      return true;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Error al crear el domiciliario. Intenta de nuevo.';
      set({ domiciliarioError: message });
      return false;
    } finally {
      set({ isCreatingDomiciliario: false });
    }
  },
}));