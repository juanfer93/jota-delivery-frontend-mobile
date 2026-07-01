import { apiRequest, apiListRequest } from '@/core/api/axios.instance';
import { 
  Pedido, 
  CreatePedidoDTO, 
  UpdatePedidoEstadoDTO,
  CurrentDeliveryItem
} from '@/features/delivery/domain/delivery.types';
import { DomiciliarioItem, Comercio } from '@/features/admin/domain/admin.types';
import { CourierManualAvailability } from '@/features/delivery/domain/courier-availability';

export const DeliveryRepository = {
  getPedidosHoy: async (): Promise<Pedido[]> => {
    return await apiListRequest<Pedido>({ 
      method: 'GET', 
      url: '/pedidos/admin/hoy'
    });
  },

  getPedidosDisponibles: async (): Promise<Pedido[]> => {
    return await apiListRequest<Pedido>({
      method: 'GET',
      url: '/pedidos/admin/domiciliarios/disponibles',
    });
  },

  tomarPedidoDisponible: async (pedidoId: string): Promise<Pedido> => {
    return await apiRequest<Pedido>({
      method: 'PATCH',
      url: `/pedidos/admin/${pedidoId}/tomar`,
    });
  },

  getPedidosHistorial: async (fecha: string): Promise<Pedido[]> => {
    return await apiListRequest<Pedido>({ 
      method: 'GET', 
      url: `/pedidos/admin/domiciliarios/history?date=${fecha}`
    });
  },

  getAllPedidosHistorial: async (search = ''): Promise<Pedido[]> => {
    const query = search.trim();
    return await apiListRequest<Pedido>({
      method: 'GET',
      url: `/pedidos/admin/history/all${query ? `?search=${encodeURIComponent(query)}` : ''}`,
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

  searchDomiciliarios: async (nombre: string): Promise<DomiciliarioItem[]> => {
    return await apiListRequest<DomiciliarioItem>({
      method: 'GET',
      url: `/usuarios/domiciliarios/search?nombre=${encodeURIComponent(nombre)}`,
    });
  },

  getComercios: async (): Promise<Comercio[]> => {
    return await apiListRequest<Comercio>({ 
      method: 'GET', 
      url: '/comercios'  
    });
  },

  searchComercios: async (nombre: string): Promise<Comercio[]> => {
    return await apiListRequest<Comercio>({
      method: 'GET',
      url: `/comercios/search?nombre=${encodeURIComponent(nombre)}`,
    });
  },

  getCurrentDelivery: async (): Promise<CurrentDeliveryItem | null> => {
    try {
      const response = await DeliveryRepository.getCurrentDeliveries();
      return response[0] ?? null;
    } catch (e: any) {
      if (e?.response?.status === 404) return null;
      throw e;
    }
  },

  getCurrentDeliveries: async (): Promise<CurrentDeliveryItem[]> => {
    try {
      return await apiListRequest<CurrentDeliveryItem>({
        method: 'GET',
        url: '/pedidos/admin/domiciliarios/current/list',
      });
    } catch (e: any) {
      if (e?.response?.status === 404) {
        const current = await apiRequest<CurrentDeliveryItem | null>({
          method: 'GET',
          url: '/pedidos/admin/domiciliarios/current',
        });

        return current ? [current] : [];
      }

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

  setCourierAvailability: async (
    disponibilidad: CourierManualAvailability,
  ): Promise<DomiciliarioItem> => {
    return await apiRequest<DomiciliarioItem>({
      method: 'PATCH',
      url: '/usuarios/perfil/disponibilidad',
      data: { disponibilidad },
    });
  },

  touchCourierPresence: async (): Promise<void> => {
    await apiRequest<void>({
      method: 'PATCH',
      url: '/usuarios/perfil/presencia',
    });
  },
};
