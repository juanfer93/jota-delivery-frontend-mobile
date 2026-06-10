import api from '@/core/api/axios.instance';
import { AdminStatusResponse, CreateAdminDTO, CreateComercioDTO } from '@/features/admin/domain/admin.types';

export const AdminRepository = {
  getAdminStatus: async (): Promise<AdminStatusResponse> => {
    const { data } = await api.get<AdminStatusResponse>('/admin/status');
    return data;
  },

  createAdmin: async (payload: CreateAdminDTO): Promise<void> => {
    await api.post('/admin/create', payload);
  },
  createComercio: async (payload: CreateComercioDTO): Promise<void> => {
    await api.post('/comercios', payload);
  },
};