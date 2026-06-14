import { Pedido } from '@/features/delivery/domain/delivery.types';

export type DeliveryHistoryFilterState = {
  domiciliario: string;
  pedido: string;
  startTime: string;
  endTime: string;
};

export type DeliveryHistoryFilterPatch = Partial<DeliveryHistoryFilterState>;

export type FilterDeliveryHistoryParams = {
  pedidos: Pedido[];
  filters: DeliveryHistoryFilterState;
  isDomiciliario: boolean;
  timeFilterError?: string | null;
};

export type DeliveryHistoryStatusStyle = {
  badge: string;
  text: string;
};