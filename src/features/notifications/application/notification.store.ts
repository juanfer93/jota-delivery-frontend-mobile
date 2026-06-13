import { create } from 'zustand';
import { NotificationPayload } from '../domain/notification.types';

interface NotificationState {
  activeNotification: NotificationPayload | null;
  openNotification: (payload: NotificationPayload) => void;
  closeNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  activeNotification: null,
  openNotification: (payload) => set({ activeNotification: payload }),
  closeNotification: () => set({ activeNotification: null }),
}));
