import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AdminProfileClient from './AdminProfileClient';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockLogout = jest.fn();
const mockGetNotificationPermissionState = jest.fn();
const mockRequestNotificationPermission = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    replace: (...args: unknown[]) => mockReplace(...args),
  },
}));

jest.mock('@/features/auth/application/auth.store', () => ({
  useAuthStore: () => ({
    user: {
      id: 'admin-uuid',
      nombre: 'Admin Jota',
      email: 'admin@test.com',
      rol: 'admin',
    },
    logout: mockLogout,
  }),
}));

jest.mock('@/features/notifications/notification.service', () => ({
  getNotificationPermissionState: (...args: unknown[]) =>
    mockGetNotificationPermissionState(...args),
  requestNotificationPermission: (...args: unknown[]) =>
    mockRequestNotificationPermission(...args),
}), { virtual: true });

describe('AdminProfileClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetNotificationPermissionState.mockResolvedValue('undetermined');
    mockRequestNotificationPermission.mockResolvedValue('granted');
  });

  it('muestra opciones de notificaciones en el perfil', async () => {
    render(<AdminProfileClient />);

    expect(await screen.findByText('Opciones')).toBeTruthy();
    expect(screen.getByText('Permitir notificaciones')).toBeTruthy();
    expect(screen.getByTestId('notifications-permission-switch')).toBeTruthy();
  });

  it('solicita permiso de notificaciones al activar el switch', async () => {
    render(<AdminProfileClient />);

    const switchControl = await screen.findByTestId('notifications-permission-switch');
    fireEvent(switchControl, 'valueChange', true);

    await waitFor(() => {
      expect(mockRequestNotificationPermission).toHaveBeenCalled();
    });
  });
});
