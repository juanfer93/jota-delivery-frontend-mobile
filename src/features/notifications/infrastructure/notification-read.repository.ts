import { apiRequest } from '@/core/api/axios.instance';

export const NotificationReadRepository = {
  markAsRead: async (notificationId: string): Promise<void> => {
    await apiRequest<void>({
      method: 'PATCH',
      url: `/notifications/${notificationId}/read`,
    });
  },
};
