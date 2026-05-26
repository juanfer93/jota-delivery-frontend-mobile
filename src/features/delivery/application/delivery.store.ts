import { create } from "zustand";
import { DeliveryRepository } from "@/core/repositories/delivery.repository";
import { Pedido, PedidoEstado, CreatePedidoDTO } from "@/features/delivery/domain/delivery.types";
import { DomiciliarioItem, Comercio } from "@/features/admin/domain/admin.types";

interface DeliveryState {
  pedidosHoy: Pedido[];
  pedidosHistorial: Pedido[];
  domiciliarios: DomiciliarioItem[];
  comercios: Comercio[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;

  loadData: () => Promise<void>;
  assignPedido: (payload: CreatePedidoDTO) => Promise<void>;
  updateEstado: (pedidoId: string, estado: PedidoEstado) => Promise<void>;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  pedidosHoy: [],
  pedidosHistorial: [],
  domiciliarios: [],
  comercios: [],
  status: 'idle',
  error: null,

  loadData: async () => {
    set({ status: 'loading', error: null });
    try {
      const [hoy, doms, coms] = await Promise.all([
        DeliveryRepository.getPedidosHoy(),
        DeliveryRepository.getDomiciliarios(),
        DeliveryRepository.getComercios(),
      ]);
      set({ pedidosHoy: hoy, domiciliarios: doms, comercios: coms, status: 'success' });
    } catch (e) {
      set({ status: 'error', error: "Error al cargar datos de delivery" });
    }
  },

  assignPedido: async (payload) => {
    set({ status: 'loading' });
    try {
      await DeliveryRepository.createPedido(payload);
      await get().loadData();
    } catch (e) {
      set({ status: 'error', error: "Error creando pedido" });
    }
  },

  updateEstado: async (pedidoId, estado) => {
    try {

      await DeliveryRepository.updatePedidoEstado(pedidoId, { 
        pedidoId: Number(pedidoId), 
        nuevoEstado: estado         
      });
      await get().loadData();
    } catch (e) {
      set({ error: "Error actualizando estado" });
    }
  }
}));