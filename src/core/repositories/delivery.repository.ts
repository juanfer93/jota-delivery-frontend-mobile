import { apiRequest, apiListRequest } from '@/core/api/axios.instance';
import { 
  Pedido, 
  CreatePedidoDTO, 
  UpdatePedidoEstadoDTO,
  CurrentDeliveryItem
} from '@/features/delivery/domain/delivery.types';
import { DomiciliarioItem, Comercio } from '@/features/admin/domain/admin.types';

export const DeliveryRepository = {
  getPedidosHoy: async (): Promise<Pedido[]> => {
    return await apiListRequest<Pedido>({ 
      method: 'GET', 
      url: '/pedidos/admin/hoy'
    });
  },

  getPedidosHistorial: async (fecha: string): Promise<Pedido[]> => {
    return await apiListRequest<Pedido>({ 
      method: 'GET', 
      url: `/pedidos/admin/history?date=${fecha}`
    });
  },

  createPedido: async (payload: CreatePedidoDTO): Promise<Pedido> => {
    return await apiRequest<Pedido>({ 
      method: 'POST', 
      url: '/pedidos/admin',  
      data: payload 
    });
  },

  updatePedidoEstado: async (id: string, payload: UpdatePedidoEstadoDTO): Promise<void> => {
    await apiRequest<void>({ 
      method: 'PATCH', 
      url: `/pedidos/admin/${id}/estado`,  
      data: payload 
    });
  },

  getDomiciliarios: async (): Promise<DomiciliarioItem[]> => {
    return await apiListRequest<DomiciliarioItem>({ 
      method: 'GET', 
      url: '/usuarios/domiciliarios'  
    });
  },

  getComercios: async (): Promise<Comercio[]> => {
    return await apiListRequest<Comercio>({ 
      method: 'GET', 
      url: '/comercios'  
    });
  },

  getCurrentDelivery: async (): Promise<CurrentDeliveryItem | null> => {
    try {
      const response = await apiRequest<CurrentDeliveryItem | null>({
        method: 'GET',
        url: '/pedidos/admin/domiciliarios/current'
      });
      return response;
    } catch (e: any) {
      if (e?.response?.status === 404) return null;
      throw e;
    }
  },

  setDomiciliarioBlocked: async (id: string, bloqueado: boolean): Promise<DomiciliarioItem> => {
    return await apiRequest<DomiciliarioItem>({
      method: 'PATCH',
      url: `/usuarios/domiciliarios/${id}/bloqueo`,
      data: { bloqueado },
    });
  },
};
