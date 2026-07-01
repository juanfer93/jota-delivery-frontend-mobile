import { create } from "zustand";
import { DeliveryRepository } from "@/core/repositories/delivery.repository";
import { Pedido, PedidoEstado, CreatePedidoDTO, CurrentDeliveryItem } from "@/features/delivery/domain/delivery.types";
import { DomiciliarioItem, Comercio } from "@/features/admin/domain/admin.types";
import { getColombiaDateKey } from '@/core/time/colombia-time';

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
  currentDeliveries: CurrentDeliveryItem[];
  blockingDomiciliarioId: string | null;

  loadData: () => Promise<void>;
  refreshPedidosHoy: () => Promise<void>;
  loadHistory: (fecha?: string) => Promise<void>;
  loadAllHistory: (search?: string) => Promise<void>;
  loadCurrentDelivery: () => Promise<void>;
  assignPedido: (payload: CreatePedidoDTO) => Promise<boolean>;
  updateEstado: (
    pedidoId: string,
    estado: PedidoEstado,
    options?: { refresh?: 'both' | 'admin' | 'current' | 'none' },
  ) => Promise<boolean>;
  toggleDomiciliarioBloqueo: (domiciliarioId: string, bloqueado: boolean) => Promise<boolean>;
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
  currentDeliveries: [],
  blockingDomiciliarioId: null,

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

  refreshPedidosHoy: async () => {
    try {
      const pedidosHoy = await DeliveryRepository.getPedidosHoy();
      set({ pedidosHoy, error: null });
    } catch (error: unknown) {
      console.error('[PEDIDOS] No se pudo sincronizar el listado.', error);
      set({ error: 'No se pudo sincronizar el estado de los pedidos' });
    }
  },

  loadHistory: async (fecha) => {
    set({ historyStatus: 'loading', historyError: null });
    const today = fecha ?? getColombiaDateKey();
    try {
      const history = await DeliveryRepository.getPedidosHistorial(today);
      set({ pedidosHistorial: history, historyStatus: 'success' });
    } catch (e: any) {
      set({ historyStatus: 'error', historyError: 'Error al cargar historial de pedidos' });
    }
  },

  loadAllHistory: async (search) => {
    set({ historyStatus: 'loading', historyError: null });
    try {
      const history = await DeliveryRepository.getAllPedidosHistorial(search);
      set({ pedidosHistorial: history, historyStatus: 'success' });
    } catch (error: unknown) {
      console.error('[PEDIDOS] No se pudo cargar el historial global.', error);
      set({ historyStatus: 'error', historyError: 'Error al cargar el historial de pedidos' });
    }
  },

  loadCurrentDelivery: async () => {
    set({ currentDeliveryStatus: 'loading', currentDeliveryError: null });
    try {
      const data = await DeliveryRepository.getCurrentDeliveries();
      set({
        currentDeliveries: data,
        currentDelivery: data[0] ?? null,
        currentDeliveryStatus: 'success',
      });
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

  updateEstado: async (pedidoId, estado, options) => {
    set({ status: 'loading', error: null });
    try {
      await DeliveryRepository.updatePedidoEstado(pedidoId, { estado });
      const refresh = options?.refresh ?? 'both';
      if (refresh === 'both') {
        await Promise.all([get().loadData(), get().loadCurrentDelivery()]);
      } else if (refresh === 'admin') {
        await get().loadData();
      } else if (refresh === 'current') {
        await get().loadCurrentDelivery();
      }
      return true;
    } catch (e: unknown) {
      set({ status: 'error', error: 'Error actualizando estado' });
      return false;
    }
  },

  toggleDomiciliarioBloqueo: async (domiciliarioId, bloqueado) => {
    set({ blockingDomiciliarioId: domiciliarioId, error: null });
    try {
      const updated = await DeliveryRepository.setDomiciliarioBlocked(domiciliarioId, bloqueado);
      set((state) => ({
        domiciliarios: state.domiciliarios.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        ),
        blockingDomiciliarioId: null,
      }));
      return true;
    } catch (error: unknown) {
      console.error('[DOMICILIARIOS] No se pudo cambiar el bloqueo.', error);
      set({ error: 'No se pudo cambiar el estado del domiciliario', blockingDomiciliarioId: null });
      return false;
    }
  },
}));
