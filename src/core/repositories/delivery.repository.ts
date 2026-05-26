import api from '@/core/api/axios.instance';
import { 
  Pedido, 
  CreatePedidoDTO, 
  UpdatePedidoEstadoDTO 
} from '@/features/delivery/domain/delivery.types';
import { DomiciliarioItem, ComercioItem } from '@/features/admin/domain/admin.types';

export const DeliveryRepository = {
  getPedidosHoy: async (): Promise<Pedido[]> => {
    const { data } = await api.get<Pedido[]>('/pedidos/hoy');
    return data;
  },

  getPedidosHistorial: async (fecha: string): Promise<Pedido[]> => {
    const { data } = await api.get<Pedido[]>(`/pedidos/historial?fecha=${fecha}`);
    return data;
  },

  createPedido: async (payload: CreatePedidoDTO): Promise<Pedido> => {
    const { data } = await api.post<Pedido>('/pedidos', payload);
    return data;
  },

  updatePedidoEstado: async (id: string, payload: UpdatePedidoEstadoDTO): Promise<void> => {
    await api.patch(`/pedidos/${id}/estado`, payload);
  },

  getDomiciliarios: async (): Promise<DomiciliarioItem[]> => {
    const { data } = await api.get<DomiciliarioItem[]>('/domiciliarios');
    return data;
  },

  getComercios: async (): Promise<ComercioItem[]> => {
    const { data } = await api.get<ComercioItem[]>('/comercios');
    return data;
  }
};