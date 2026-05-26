import { apiRequest, apiListRequest } from '@/core/api/axios.instance';
import { 
  Pedido, 
  CreatePedidoDTO, 
  UpdatePedidoEstadoDTO 
} from '@/features/delivery/domain/delivery.types';
import { DomiciliarioItem, Comercio } from '@/features/admin/domain/admin.types';

export const DeliveryRepository = {
  getPedidosHoy: async (): Promise<Pedido[]> => {
    return await apiListRequest<Pedido>({ method: 'GET', url: '/pedidos/hoy' });
  },

  getPedidosHistorial: async (fecha: string): Promise<Pedido[]> => {
    return await apiListRequest<Pedido>({ 
      method: 'GET', 
      url: `/pedidos/historial?fecha=${fecha}` 
    });
  },

  createPedido: async (payload: CreatePedidoDTO): Promise<Pedido> => {
    return await apiRequest<Pedido>({ 
      method: 'POST', 
      url: '/pedidos', 
      data: payload 
    });
  },

  updatePedidoEstado: async (id: string, payload: UpdatePedidoEstadoDTO): Promise<void> => {
    await apiRequest<void>({ 
      method: 'PATCH', 
      url: `/pedidos/${id}/estado`, 
      data: payload 
    });
  },

  getDomiciliarios: async (): Promise<DomiciliarioItem[]> => {
    return await apiListRequest<DomiciliarioItem>({ method: 'GET', url: '/domiciliarios' });
  },

  getComercios: async (): Promise<Comercio[]> => {
    return await apiListRequest<Comercio>({ method: 'GET', url: '/comercios' });
  }
};