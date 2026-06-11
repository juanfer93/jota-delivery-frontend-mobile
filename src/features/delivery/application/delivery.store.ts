import { create } from "zustand";
import { DeliveryRepository } from "@/core/repositories/delivery.repository";
import { Pedido, PedidoEstado, CreatePedidoDTO, CurrentDeliveryItem } from "@/features/delivery/domain/delivery.types";
import { DomiciliarioItem, Comercio } from "@/features/admin/domain/admin.types";

interface DeliveryState {
  pedidosHoy: Pedido[];
  pedidosHistorial: Pedido[];
  domiciliarios: DomiciliarioItem[];
  comercios: Comercio[];
  status: 'idle' | 'loading' | 'success' | 'error';
  historyStatus: 'idle' | 'loading' | 'success' | 'error';
  currentDeliveryStatus: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  historyError: string | null;
  currentDeliveryError: string | null;
  currentDelivery: CurrentDeliveryItem | null;

  loadData: () => Promise<void>;
  loadHistory: (fecha?: string) => Promise<void>;
  loadCurrentDelivery: () => Promise<void>;
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
  currentDeliveryStatus: 'idle',
  error: null,
  historyError: null,
  currentDeliveryError: null,
  currentDelivery: null,

  loadData: async () => {
    set({ status: 'loading', error: null });
    try {
      const [hoy, doms, coms] = await Promise.all([
        DeliveryRepository.getPedidosHoy(),
        DeliveryRepository.getDomiciliarios(),
        DeliveryRepository.getComercios(),
      ]);
      set({ pedidosHoy: hoy, domiciliarios: doms, comercios: coms, status: 'success' });
    } catch (e: any) {
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
      set({ historyStatus: 'error', historyError: 'Error al cargar historial de pedidos' });
    }
  },

  loadCurrentDelivery: async () => {
    set({ currentDeliveryStatus: 'loading', currentDeliveryError: null });
    try {
      const data = await DeliveryRepository.getCurrentDelivery();
      set({ currentDelivery: data, currentDeliveryStatus: 'success' });
    } catch (e: any) {
      set({ currentDeliveryStatus: 'error', currentDeliveryError: 'Error cargando pedido actual' });
    }
  },

  assignPedido: async (payload) => {
    set({ status: 'loading', error: null });
    try {
      await DeliveryRepository.createPedido(payload);
      await get().loadData();
      return true;
    } catch (e: any) {
      set({ status: 'error', error: 'Error creando pedido' });
      return false;
    }
  },

  updateEstado: async (pedidoId, estado) => {
    set({ status: 'loading', error: null });
    try {
      await DeliveryRepository.updatePedidoEstado(pedidoId, { estado });
      await get().loadData();
      return true;
    } catch (e: any) {
      set({ status: 'error', error: 'Error actualizando estado' });
      return false;
    }
  },
}));
