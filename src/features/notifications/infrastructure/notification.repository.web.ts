import { apiRequest } from '@/core/api/axios.instance';

interface WebPushKeys {
  p256dh: string;
  auth: string;
}

export interface WebPushSubscriptionInput {
  endpoint: string;
  expirationTime: number | null;
  keys: WebPushKeys;
}

export const NotificationRepository = {
  getWebPushPublicKey: async (): Promise<string> => {
    const response = await apiRequest<{ publicKey: string }>({
      method: 'GET',
      url: '/notifications/public-key',
    });
    return response.publicKey;
  },

  subscribeWebPush: async (subscription: WebPushSubscriptionInput): Promise<void> => {
    await apiRequest<void>({
      method: 'POST',
      url: '/notifications/subscribe',
      data: subscription,
    });
  },
};
