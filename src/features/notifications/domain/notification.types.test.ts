import { PedidoEstado } from '@/features/delivery/domain/delivery.types';
import { parseNotificationPayload } from './notification.types';

describe('parseNotificationPayload', () => {
  it('acepta el payload tipado de cambio de estado', () => {
    expect(parseNotificationPayload({
      notificationId: 'notification-id',
      type: 'PEDIDO_ESTADO_ACTUALIZADO',
      pedidoId: 'pedido-id',
      estado: PedidoEstado.HECHO,
      domiciliarioNombre: 'Ana',
      ganancia: '9000',
      valorDomicilio: 9000,
      createdAt: '2026-06-12T18:30:00.000Z',
    })).toEqual({
      notificationId: 'notification-id',
      type: 'PEDIDO_ESTADO_ACTUALIZADO',
      pedidoId: 'pedido-id',
      estado: PedidoEstado.HECHO,
      domiciliarioNombre: 'Ana',
      title: undefined,
      body: undefined,
      url: undefined,
      domiciliarioId: undefined,
      comercioNombre: undefined,
      direccionRecogida: undefined,
      direccionDestino: undefined,
      ganancia: 9000,
      valorDomicilio: 9000,
      createdAt: '2026-06-12T18:30:00.000Z',
    });
  });

  it('descarta payloads que no identifican un pedido', () => {
    expect(parseNotificationPayload({ title: 'Sin pedido' })).toBeNull();
    expect(parseNotificationPayload(null)).toBeNull();
  });
});
