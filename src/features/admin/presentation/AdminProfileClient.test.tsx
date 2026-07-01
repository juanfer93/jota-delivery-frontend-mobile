import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AdminProfileClient from './AdminProfileClient';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockLogout = jest.fn();
const mockCheckAuth = jest.fn();
const mockGetNotificationPermissionState = jest.fn();
const mockRequestNotificationPermission = jest.fn();
const mockLoadCurrentDelivery = jest.fn();
const mockSetCourierAvailability = jest.fn();
let mockUser = {
  id: 'admin-uuid',
  nombre: 'Admin Jota',
  email: 'admin@test.com',
  rol: 'admin',
  gananciaDia: undefined as number | undefined,
  disponibilidad: undefined as 'available' | 'offline' | undefined,
};

jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    replace: (...args: unknown[]) => mockReplace(...args),
  },
  useFocusEffect: (callback: () => void) => callback(),
}));

jest.mock('@/features/auth/application/auth.store', () => ({
  useAuthStore: () => ({
    user: mockUser,
    logout: mockLogout,
    checkAuth: mockCheckAuth,
  }),
}));

jest.mock('@/core/repositories/delivery.repository', () => ({
  DeliveryRepository: {
    setCourierAvailability: (...args: unknown[]) => mockSetCourierAvailability(...args),
  },
}));

jest.mock('@/features/delivery/application/delivery.store', () => ({
  useDeliveryStore: () => ({
    currentDelivery: null,
    currentDeliveries: [],
    loadCurrentDelivery: mockLoadCurrentDelivery,
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
    mockUser = {
      id: 'admin-uuid',
      nombre: 'Admin Jota',
      email: 'admin@test.com',
      rol: 'admin',
      gananciaDia: undefined,
      disponibilidad: undefined,
    };
    mockGetNotificationPermissionState.mockResolvedValue('undetermined');
    mockRequestNotificationPermission.mockResolvedValue('granted');
    mockCheckAuth.mockResolvedValue(undefined);
    mockLoadCurrentDelivery.mockResolvedValue(undefined);
    mockSetCourierAvailability.mockResolvedValue(undefined);
  });

  it('muestra opciones de notificaciones en el perfil', async () => {
    render(<AdminProfileClient />);

    expect(await screen.findByText('Opciones')).toBeTruthy();
    expect(screen.getByText('Permitir notificaciones')).toBeTruthy();
    expect(screen.getByTestId('notifications-permission-switch')).toBeTruthy();
    expect(screen.queryByText(/Ganancias de hoy/)).toBeNull();
  });

  it('solicita permiso de notificaciones al activar el switch', async () => {
    render(<AdminProfileClient />);

    const switchControl = await screen.findByTestId('notifications-permission-switch');
    fireEvent(switchControl, 'valueChange', true);

    await waitFor(() => {
      expect(mockRequestNotificationPermission).toHaveBeenCalled();
    });
  });

  it('muestra ganancias del dia solo para domiciliario', async () => {
    mockUser = {
      id: 'domi-uuid',
      nombre: 'Domi Jota',
      email: 'domi@test.com',
      rol: 'domiciliario',
      gananciaDia: 18000,
      disponibilidad: 'available',
    };

    render(<AdminProfileClient />);

    expect(await screen.findByText(/Ganancias de hoy:/)).toBeTruthy();
    expect(screen.getByText(/\$\s*18\.000/)).toBeTruthy();
    expect(await screen.findByText('Estado: Disponible')).toBeTruthy();
    expect(screen.getByTestId('courier-availability-switch')).toBeTruthy();
    expect(mockCheckAuth).toHaveBeenCalled();
  });

  it('permite marcar al domiciliario como desconectado desde perfil', async () => {
    mockUser = {
      id: 'domi-uuid',
      nombre: 'Domi Jota',
      email: 'domi@test.com',
      rol: 'domiciliario',
      gananciaDia: 18000,
      disponibilidad: 'available',
    };

    render(<AdminProfileClient />);

    const switchControl = await screen.findByTestId('courier-availability-switch');
    fireEvent(switchControl, 'valueChange', false);

    await waitFor(() => {
      expect(mockSetCourierAvailability).toHaveBeenCalledWith('offline');
    });
    expect(screen.getByText('Estado: Desconectado')).toBeTruthy();
  });

  it('refresca el perfil cuando la pantalla toma foco', async () => {
    mockUser = {
      id: 'domi-uuid',
      nombre: 'Domi Jota',
      email: 'domi@test.com',
      rol: 'domiciliario',
      gananciaDia: 27000,
      disponibilidad: 'available',
    };

    render(<AdminProfileClient />);

    await waitFor(() => {
      expect(mockCheckAuth).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText(/\$\s*27\.000/)).toBeTruthy();
  });
});
