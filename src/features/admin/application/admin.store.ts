import { create } from "zustand";
import { AdminRepository } from "@/core/repositories/admin.repository";
import { CreateAdminDTO } from "@/features/admin/domain/admin.types";

interface AdminState {
  hasAdmin: boolean | null;
  adminName: string | null;
  checkStatus: () => Promise<void>;
  createAdmin: (payload: CreateAdminDTO) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  hasAdmin: null,
  adminName: null,

  checkStatus: async () => {
    try {
      const data = await AdminRepository.getAdminStatus();
      set({ hasAdmin: data.hasAdmin, adminName: data.adminName ?? null });
    } catch (e) {
      set({ hasAdmin: false });
    }
  },

  createAdmin: async (payload) => {
    await AdminRepository.createAdmin(payload);
    set({ hasAdmin: true, adminName: payload.nombre });
  }
}));