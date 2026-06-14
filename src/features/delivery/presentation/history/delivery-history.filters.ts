import { Pedido, PedidoEstado } from '@/features/delivery/domain/delivery.types';
import {
  DeliveryHistoryFilterState,
  FilterDeliveryHistoryParams,
} from '@/features/delivery/domain/delivery-history.types';

const COLOMBIA_TIME_ZONE = 'America/Bogota';

export const INITIAL_DELIVERY_HISTORY_FILTERS: DeliveryHistoryFilterState = {
  domiciliario: '',
  pedido: '',
  startTime: '',
  endTime: '',
};

function normalizeText(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLocaleLowerCase('es-CO');
}

function parseTimeToMinutes(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(trimmed);

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return hours * 60 + minutes;
}

function isInvalidTimeValue(value: string): boolean {
  return value.trim().length > 0 && parseTimeToMinutes(value) === null;
}

function getColombiaMinutesOfDay(value: string): number | null {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: COLOMBIA_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const hourPart = parts.find((part) => part.type === 'hour')?.value;
  const minutePart = parts.find((part) => part.type === 'minute')?.value;

  if (!hourPart || !minutePart) {
    return null;
  }

  const rawHour = Number(hourPart);
  const hour = rawHour === 24 ? 0 : rawHour;
  const minute = Number(minutePart);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return hour * 60 + minute;
}

function getPedidoSearchText(pedido: Pedido): string {
  return normalizeText(
    [
      pedido.id,
      pedido.id.slice(-6),
      pedido.estado,
      pedido.direccionDestino,
      pedido.direccionRecogida,
      pedido.direccionEntrega,
      pedido.detallesAdicionales,
      pedido.clienteNombre,
      pedido.clienteTelefono,
      pedido.comercio?.nombre,
      pedido.comercio?.direccion,
      pedido.valorFinal,
      pedido.valorPedido,
      pedido.valorDomicilio,
    ]
      .filter(Boolean)
      .join(' '),
  );
}

function getDomiciliarioSearchText(pedido: Pedido): string {
  return normalizeText(
    [
      pedido.usuario?.nombre,
      pedido.usuario?.email,
    ]
      .filter(Boolean)
      .join(' '),
  );
}

function matchesPedidoFilter(pedido: Pedido, pedidoFilter: string): boolean {
  const normalizedFilter = normalizeText(pedidoFilter);

  if (!normalizedFilter) {
    return true;
  }

  return getPedidoSearchText(pedido).includes(normalizedFilter);
}

function matchesDomiciliarioFilter(
  pedido: Pedido,
  domiciliarioFilter: string,
): boolean {
  const normalizedFilter = normalizeText(domiciliarioFilter);

  if (!normalizedFilter) {
    return true;
  }

  return getDomiciliarioSearchText(pedido).includes(normalizedFilter);
}

function matchesTimeRange(
  pedido: Pedido,
  startTime: string,
  endTime: string,
): boolean {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (startMinutes === null && endMinutes === null) {
    return true;
  }

  const pedidoMinutes = getColombiaMinutesOfDay(pedido.createdAt);

  if (pedidoMinutes === null) {
    return false;
  }

  if (startMinutes !== null && pedidoMinutes < startMinutes) {
    return false;
  }

  if (endMinutes !== null && pedidoMinutes > endMinutes) {
    return false;
  }

  return true;
}

export function getTimeFilterError(
  startTime: string,
  endTime: string,
): string | null {
  if (isInvalidTimeValue(startTime) || isInvalidTimeValue(endTime)) {
    return 'Usa el formato HH:mm. Ejemplo: 08:00 o 18:30.';
  }

  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (startMinutes !== null && endMinutes !== null && startMinutes > endMinutes) {
    return 'La hora inicial no puede ser mayor que la hora final.';
  }

  return null;
}

export function getBaseHistoryPedidos(
  pedidos: Pedido[],
  isDomiciliario: boolean,
): Pedido[] {
  if (!isDomiciliario) {
    return pedidos;
  }

  return pedidos.filter(
    (pedido) =>
      pedido.estado === PedidoEstado.HECHO ||
      pedido.estado === PedidoEstado.CANCELADO,
  );
}

export function filterDeliveryHistory({
  pedidos,
  filters,
  isDomiciliario,
  timeFilterError = null,
}: FilterDeliveryHistoryParams): Pedido[] {
  if (timeFilterError) {
    return [];
  }

  return pedidos.filter((pedido) => {
    const matchesPedido = matchesPedidoFilter(pedido, filters.pedido);

    const matchesDomiciliario = isDomiciliario
      ? true
      : matchesDomiciliarioFilter(pedido, filters.domiciliario);

    const matchesTime = matchesTimeRange(
      pedido,
      filters.startTime,
      filters.endTime,
    );

    return matchesPedido && matchesDomiciliario && matchesTime;
  });
}

export function formatMoney(value: number | undefined): string {
  return Number(value ?? 0).toLocaleString('es-CO');
}