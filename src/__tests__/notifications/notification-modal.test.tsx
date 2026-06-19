import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { PedidoEstado } from '@/features/delivery/domain/delivery.types';

const mockPush = jest.fn();
const mockCloseNotification = jest.fn();
const mockLoadCurrentDelivery = jest.fn();
const mockLoadData = jest.fn();
const mockUpdateEstado = jest.fn();
const mockMarkAsRead = jest.fn();

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
      activeNotification: {
        notificationId: 'notif-uuid',
        type: 'PEDIDO_ASIGNADO',
        pedidoId: 'pedido-uuid',
        title: 'Nuevo pedido asignado',
        body: 'Tienes un nuevo servicio en curso. ¡Revísalo!',
        createdAt: '2026-06-17T20:00:00.000Z',
      },
      closeNotification: mockCloseNotification,
    }),
}));

jest.mock('@/features/delivery/application/delivery.store', () => ({
  useDeliveryStore: () => ({
    currentDelivery: {
      id: 'pedido-uuid',
      estado: 'EN_PROCESO',
      valorFinal: 14935.12,
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
    mockMarkAsRead.mockResolvedValue(undefined);
    mockUpdateEstado.mockResolvedValue(true);
  });

  it('muestra el pedido asignado como ventana de servicio y permite tomarlo', async () => {
    render(<NotificationPedidoModal />);

    expect(await screen.findByText('Servicio disponible')).toBeTruthy();
    expect(screen.getByText('Nuevo pedido asignado')).toBeTruthy();
    expect(screen.getByText('Tomar servicio')).toBeTruthy();
    expect(screen.getByText('No tomar ahora')).toBeTruthy();

    fireEvent.press(screen.getByTestId('notification-primary-action'));

    expect(mockCloseNotification).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/delivery/current-delivery');
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
