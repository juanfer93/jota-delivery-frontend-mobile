import { DomiciliarioItem } from '@/features/admin/domain/admin.types';
import { Pedido, PedidoEstado } from '@/features/delivery/domain/delivery.types';

export type CourierAvailabilityStatus = 'available' | 'busy' | 'offline';
export type CourierManualAvailability = 'available' | 'offline';

export const COURIER_AVAILABILITY_LABELS: Record<CourierAvailabilityStatus, string> = {
  available: 'Disponible',
  busy: 'Ocupado',
  offline: 'Desconectado',
};

export const COURIER_AVAILABILITY_COLORS: Record<CourierAvailabilityStatus, string> = {
  available: '#22C55E',
  busy: '#EAB308',
  offline: '#EF4444',
};

const BACKEND_STATUS_FIELDS = [
  'availabilityStatus',
  'availability_status',
  'disponibilidad',
  'estadoDisponibilidad',
  'estado_disponibilidad',
  'estadoConexion',
  'estado_conexion',
] as const;

export function getPedidoDomiciliarioId(pedido: Pedido): string | null {
  return pedido.domiciliarioId ?? pedido.usuario?.id ?? pedido.usuarioId ?? null;
}

export function getBusyDomiciliarioIds(pedidos: Pedido[]): Set<string> {
  return new Set(
    pedidos
      .filter((pedido) => pedido.estado === PedidoEstado.EN_PROCESO)
      .map(getPedidoDomiciliarioId)
      .filter((id): id is string => Boolean(id)),
  );
}

export function parseCourierAvailabilityStatus(value: unknown): CourierAvailabilityStatus | null {
  if (typeof value !== 'string') return null;

  const normalized = value.trim().toLowerCase();

  if (['available', 'disponible', 'activo', 'online', 'conectado'].includes(normalized)) {
    return 'available';
  }

  if (['busy', 'ocupado', 'en_pedido', 'en-proceso', 'en_proceso'].includes(normalized)) {
    return 'busy';
  }

  if (['offline', 'desconectado', 'inactivo', 'disconnected'].includes(normalized)) {
    return 'offline';
  }

  return null;
}

export function getBackendCourierAvailability(
  domiciliario?: Partial<DomiciliarioItem> | null,
): CourierAvailabilityStatus | null {
  if (!domiciliario) return null;

  const record = domiciliario as Record<string, unknown>;

  for (const field of BACKEND_STATUS_FIELDS) {
    const parsed = parseCourierAvailabilityStatus(record[field]);
    if (parsed) return parsed;
  }

  return null;
}

export function resolveCourierAvailabilityStatus({
  hasActiveDelivery,
  backendStatus,
  manualStatus,
}: {
  hasActiveDelivery?: boolean;
  backendStatus?: CourierAvailabilityStatus | null;
  manualStatus?: CourierManualAvailability | null;
}): CourierAvailabilityStatus {
  if (hasActiveDelivery || backendStatus === 'busy') return 'busy';
  if (backendStatus === 'offline' || manualStatus === 'offline') return 'offline';
  return 'available';
}
