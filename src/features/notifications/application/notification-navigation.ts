import { NotificationPayload } from '../domain/notification.types';

export function getNotificationRoute(payload: NotificationPayload): string {
  if (payload.type === 'PEDIDO_ASIGNADO') {
    return '/profile/current-delivery';
  }

  return `/delivery?pedidoId=${encodeURIComponent(payload.pedidoId)}`;
}
