import { create } from "zustand";
import { DeliveryRepository } from "@/core/repositories/delivery.repository";
import { DomiciliarioItem } from "@/features/admin/domain/admin.types";

interface DomiciliariosState {
  list: DomiciliarioItem[];
  fetchDomiciliarios: () => Promise<void>;
  deleteDomiciliario: (id: string) => Promise<void>;
}

export const useDomiciliariosStore = create<DomiciliariosState>((set) => ({
  list: [],
  fetchDomiciliarios: async () => {
    const data = await DeliveryRepository.getDomiciliarios();
    set({ list: data });
  },
  deleteDomiciliario: async (id) => {
    set(state => ({ list: state.list.filter(d => d.id !== id) }));
  }
}));
