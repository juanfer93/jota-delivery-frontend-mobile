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
  historyStatus: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  historyError: string | null;

  loadData: () => Promise<void>;
  loadHistory: (fecha?: string) => Promise<void>;
  assignPedido: (payload: CreatePedidoDTO) => Promise<boolean>;
  updateEstado: (pedidoId: string, estado: PedidoEstado) => Promise<boolean>;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  pedidosHoy: [],
  pedidosHistorial: [],
  domiciliarios: [],
  comercios: [],
  status: 'idle',
  historyStatus: 'idle',
  error: null,
  historyError: null,

  loadData: async () => {
    set({ status: 'loading', error: null });
    console.log('📦 [DELIVERY] Iniciando carga de datos...');
    try {
      const [hoy, doms, coms] = await Promise.all([
        DeliveryRepository.getPedidosHoy(),
        DeliveryRepository.getDomiciliarios(),
        DeliveryRepository.getComercios(),
      ]);
      console.log('📦 [DELIVERY] Datos cargados exitosamente');
      set({ pedidosHoy: hoy, domiciliarios: doms, comercios: coms, status: 'success' });
    } catch (e: any) {
      console.error('❌ [DELIVERY] Error al cargar datos:', e?.response?.status, e?.response?.data);
      set({ status: 'error', error: 'Error al cargar datos de delivery' });
    }
  },

  loadHistory: async (fecha) => {
    set({ historyStatus: 'loading', historyError: null });
    const today = fecha ?? new Date().toISOString().slice(0, 10);
    try {
      const history = await DeliveryRepository.getPedidosHistorial(today);
      set({ pedidosHistorial: history, historyStatus: 'success' });
    } catch (e: any) {
      console.error('❌ [DELIVERY] Error al cargar historial:', e?.response?.status, e?.response?.data);
      set({ historyStatus: 'error', historyError: 'Error al cargar historial de pedidos' });
    }
  },

  assignPedido: async (payload) => {
    set({ status: 'loading', error: null });
    try {
      await DeliveryRepository.createPedido(payload);
      await get().loadData();
      return true;
    } catch (e: any) {
      console.error('❌ [DELIVERY] Error creando pedido:', e?.response?.data ?? e?.message ?? e);
      set({ status: 'error', error: 'Error creando pedido' });
      return false;
    }
  },

  updateEstado: async (pedidoId, estado) => {
    set({ status: 'loading', error: null });
    try {
      await DeliveryRepository.updatePedidoEstado(pedidoId, {
        pedidoId: Number(pedidoId),
        nuevoEstado: estado,
      });
      await get().loadData();
      return true;
    } catch (e: any) {
      console.error('❌ [DELIVERY] Error actualizando estado:', e?.response?.data ?? e?.message ?? e);
      set({ status: 'error', error: 'Error actualizando estado' });
      return false;
    }
  },
}));