import { create } from 'zustand';
import api from '@/core/api/axios.instance';
import { CreateAdminForm } from '@/features/admin/domain/admin.schema';

interface AdminStore {
  isCreating: boolean;
  createFirstAdmin: (data: CreateAdminForm) => Promise<void>;
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
      });
    } finally {
      set({ isCreating: false });
    }
  },
}));