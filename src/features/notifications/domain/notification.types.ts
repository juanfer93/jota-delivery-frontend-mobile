import { PedidoEstado } from '@/features/delivery/domain/delivery.types';

export type NotificationKind =
  | 'PEDIDO_DISPONIBLE'
  | 'PEDIDO_ASIGNADO'
  | 'PEDIDO_TOMADO'
  | 'PEDIDO_ESTADO_ACTUALIZADO';

export interface NotificationPayload {
  notificationId?: string;
  type?: NotificationKind;
  pedidoId: string;
  title?: string;
  body?: string;
  url?: string;
  estado?: PedidoEstado;
  domiciliarioId?: string;
  domiciliarioNombre?: string;
  comercioNombre?: string;
  direccionRecogida?: string;
  direccionDestino?: string;
  ganancia?: number;
  valorDomicilio?: number;
  createdAt?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function isPedidoEstado(value: unknown): value is PedidoEstado {
  return Object.values(PedidoEstado).includes(value as PedidoEstado);
}

function isNotificationKind(value: unknown): value is NotificationKind {
  return value === 'PEDIDO_DISPONIBLE'
    || value === 'PEDIDO_ASIGNADO'
    || value === 'PEDIDO_TOMADO'
    || value === 'PEDIDO_ESTADO_ACTUALIZADO';
}

export function parseNotificationPayload(value: unknown): NotificationPayload | null {
  if (!isRecord(value)) return null;

  const pedidoId = optionalString(value.pedidoId);
  if (!pedidoId) return null;

  return {
    pedidoId,
    notificationId: optionalString(value.notificationId),
    type: isNotificationKind(value.type) ? value.type : undefined,
    title: optionalString(value.title),
    body: optionalString(value.body),
    url: optionalString(value.url),
    estado: isPedidoEstado(value.estado) ? value.estado : undefined,
    domiciliarioId: optionalString(value.domiciliarioId),
    domiciliarioNombre: optionalString(value.domiciliarioNombre),
    comercioNombre: optionalString(value.comercioNombre),
    direccionRecogida: optionalString(value.direccionRecogida),
    direccionDestino: optionalString(value.direccionDestino),
    ganancia: optionalNumber(value.ganancia),
    valorDomicilio: optionalNumber(value.valorDomicilio),
    createdAt: optionalString(value.createdAt),
  };
}
