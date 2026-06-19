export function formatMoney(value: number) {
  return Number(value ?? 0).toLocaleString('es-CO');
}
