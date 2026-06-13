import { apiRequest } from '@/core/api/axios.instance';

export const NotificationRepository = {
  registerExpoToken: async (token: string): Promise<void> => {
    await apiRequest<void>({
      method: 'POST',
      url: '/notifications/register-token',
      data: {
        token,
        platform: 'android',
        provider: 'EXPO',
      },
    });
  },
};
