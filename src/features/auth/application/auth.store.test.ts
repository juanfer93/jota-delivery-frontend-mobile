import api from '@/core/api/axios.instance';
import { TokenStorage } from '@/core/storage/token.storage';
import { useAuthStore } from './auth.store';
import { UserRole } from '../domain/auth.types';

jest.mock('@/core/api/axios.instance', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('@/core/storage/token.storage', () => ({
  TokenStorage: {
    getToken: jest.fn(),
    setToken: jest.fn(),
    removeToken: jest.fn(),
  },
}));

describe('auth store', () => {
  it('revalida la sesion con el endpoint real del perfil', async () => {
    const usuario = {
      id: 'admin-1',
      nombre: 'Admin',
      email: 'admin@jota.com',
      rol: UserRole.ADMIN,
    };
    jest.mocked(TokenStorage.getToken).mockResolvedValue('token-valido');
    jest.mocked(api.get).mockResolvedValue({ data: { data: usuario } });

    await useAuthStore.getState().checkAuth();

    expect(api.get).toHaveBeenCalledWith('/usuarios/perfil');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user).toEqual(usuario);
  });
});
