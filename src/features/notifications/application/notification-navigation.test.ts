import { PedidoEstado } from '@/features/delivery/domain/delivery.types';
import { getNotificationRoute } from './notification-navigation';

describe('getNotificationRoute', () => {
  it('lleva al domiciliario al pedido actual', () => {
    expect(getNotificationRoute({
      type: 'PEDIDO_ASIGNADO',
      pedidoId: 'pedido-1',
    })).toBe('/profile/current-delivery');
  });

  it('lleva al admin al pedido que cambio de estado', () => {
    expect(getNotificationRoute({
      type: 'PEDIDO_ESTADO_ACTUALIZADO',
      pedidoId: 'pedido con espacios',
      estado: PedidoEstado.HECHO,
    })).toBe('/delivery?pedidoId=pedido%20con%20espacios');
  });
});
