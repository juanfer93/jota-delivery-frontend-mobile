export function formatMoney(value: number) {
  return Number(value ?? 0).toLocaleString('es-CO');
}

export function getPickupAddress<T extends {
  direccionRecogida?: string | null;
  comercio?: { direccion?: string | null } | null;
}>(pedido: T) {
  return pedido.direccionRecogida || pedido.comercio?.direccion || 'Direccion pendiente';
}

export function formatRouteSummary<T extends {
  direccionDestino: string;
  direccionRecogida?: string | null;
  comercio?: { nombre?: string | null; direccion?: string | null } | null;
}>(pedido: T) {
  const pickupName = pedido.comercio?.nombre ?? 'el comercio';
  const pickupAddress = getPickupAddress(pedido);
  return `Recoger en ${pickupName}, ${pickupAddress}. Entregar en ${pedido.direccionDestino}.`;
}
