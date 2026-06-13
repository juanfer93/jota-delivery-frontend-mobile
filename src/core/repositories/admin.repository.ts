import api from '@/core/api/axios.instance';
import { CreateAdminDTO, CreateComercioDTO } from '@/features/admin/domain/admin.types';

export const AdminRepository = {
  createAdmin: async (payload: CreateAdminDTO): Promise<void> => {
    await api.post('/admin/create', payload);
  },
  createComercio: async (payload: CreateComercioDTO): Promise<void> => {
    await api.post('/comercios', payload);
  },
};
