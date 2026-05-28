import { create } from 'zustand';
import api from '@/core/api/axios.instance';
import { CreateAdminDTO } from '@/features/admin/domain/admin.types';

interface AdminStore {
  isCreating: boolean;
  createFirstAdmin: (data: CreateAdminDTO) => Promise<void>;
}

export const useAdminStore = create<AdminStore>((set) => ({
  isCreating: false,
  createFirstAdmin: async (data) => {
    set({ isCreating: true });
    try {
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
}));