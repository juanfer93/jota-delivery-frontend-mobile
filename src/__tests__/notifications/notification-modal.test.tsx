import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { PedidoEstado } from '@/features/delivery/domain/delivery.types';

const mockPush = jest.fn();
const mockCloseNotification = jest.fn();
const mockLoadCurrentDelivery = jest.fn();
const mockLoadData = jest.fn();
const mockUpdateEstado = jest.fn();
const mockMarkAsRead = jest.fn();

let mockNotification: any = {
  notificationId: 'notif-uuid',
  type: 'PEDIDO_ASIGNADO',
  pedidoId: 'pedido-uuid',
  title: 'Nuevo pedido asignado',
  body: 'Tienes un nuevo servicio en curso.',
  createdAt: '2026-06-17T20:00:00.000Z',
};

jest.mock('expo-router', () => ({
  __esModule: true,
  router: {
    push: (...args: unknown[]) => mockPush(...args),
  },
}));

jest.mock('@/features/auth/application/auth.store', () => ({
  useAuthStore: (selector: any) =>
    selector({
      user: {
        id: 'domi-uuid',
        nombre: 'Domi Libre',
        email: 'domi@test.com',
        rol: 'Domiciliario',
      },
    }),
}));

jest.mock('@/features/notifications/application/notification.store', () => ({
  useNotificationStore: (selector: any) =>
    selector({
      activeNotification: mockNotification,
      closeNotification: mockCloseNotification,
    }),
}));

jest.mock('@/features/delivery/application/delivery.store', () => ({
  useDeliveryStore: () => ({
    currentDelivery: {
      id: 'pedido-uuid',
      estado: 'EN_PROCESO',
      valorFinal: 14935.12,
      valorDomicilio: 1000,
      ganancia: 9000,
      direccionDestino: 'KR 57 # 84',
      clienteNombre: 'Cliente prueba',
      comercio: {
        nombre: 'Comercio Uno',
      },
      createdAt: '2026-06-17T20:00:00.000Z',
    },
    pedidosHoy: [],
    currentDeliveryStatus: 'success',
    loadCurrentDelivery: mockLoadCurrentDelivery,
    loadData: mockLoadData,
    updateEstado: mockUpdateEstado,
  }),
}));

jest.mock('../../features/notifications/infrastructure/notification-read.repository', () => ({
  NotificationReadRepository: {
    markAsRead: (...args: unknown[]) => mockMarkAsRead(...args),
  },
}));

const { NotificationPedidoModal } = require('@/features/notifications/presentation/NotificationPedidoModal');

describe('NotificationPedidoModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotification = {
      notificationId: 'notif-uuid',
      type: 'PEDIDO_ASIGNADO',
      pedidoId: 'pedido-uuid',
      title: 'Nuevo pedido asignado',
      body: 'Tienes un nuevo servicio en curso.',
      createdAt: '2026-06-17T20:00:00.000Z',
    };
    mockMarkAsRead.mockResolvedValue(undefined);
    mockUpdateEstado.mockResolvedValue(true);
  });

  it('muestra el pedido asignado como ventana de servicio y permite tomarlo', async () => {
    render(<NotificationPedidoModal />);

    expect(await screen.findByText('Servicio disponible')).toBeTruthy();
    expect(screen.getByText('Nuevo pedido')).toBeTruthy();
    expect(screen.getByText('Recoger en Comercio Uno, Direccion pendiente. Entregar en KR 57 # 84.')).toBeTruthy();
    expect(screen.getByText('Ganancia $9.000')).toBeTruthy();
    expect(screen.getByText('Tomar servicio')).toBeTruthy();
    expect(screen.getByText('No tomar ahora')).toBeTruthy();

    fireEvent.press(screen.getByTestId('notification-primary-action'));

    expect(mockCloseNotification).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/delivery/current-delivery');
  });

  it('usa la ruta y ganancia del payload cuando el pedido disponible aun no esta cargado', async () => {
    mockNotification = {
      notificationId: 'notif-uuid',
      type: 'PEDIDO_DISPONIBLE',
      pedidoId: 'pedido-libre',
      title: 'Nuevo pedido disponible',
      body: 'Recoger en Buffalo Grill. Entregar en Calle 5 # 6-7.',
      comercioNombre: 'Buffalo Grill',
      direccionRecogida: 'Cra 1 # 2-3',
      direccionDestino: 'Calle 5 # 6-7',
      ganancia: 8000,
      createdAt: '2026-06-17T20:00:00.000Z',
    };

    render(<NotificationPedidoModal />);

    expect(await screen.findByText('Nuevo pedido')).toBeTruthy();
    expect(screen.queryByText('Nuevo pedido disponible')).toBeNull();
    expect(screen.getByText('Recoger en Buffalo Grill, Cra 1 # 2-3. Entregar en Calle 5 # 6-7.')).toBeTruthy();
    expect(screen.getByText('Ganancia $8.000')).toBeTruthy();
    expect(screen.queryByTestId('notification-status-HECHO')).toBeNull();
  });

  it('permite finalizar el servicio desde la ventana', async () => {
    render(<NotificationPedidoModal />);

    fireEvent.press(await screen.findByTestId('notification-status-HECHO'));

    await waitFor(() => {
      expect(mockUpdateEstado).toHaveBeenCalledWith('pedido-uuid', PedidoEstado.HECHO, { refresh: 'current' });
      expect(mockCloseNotification).toHaveBeenCalled();
    });
  });
});
