import { apiRequest } from '@/core/api/axios.instance';
import { NotificationRepository as AndroidNotificationRepository } from './notification.repository.android';
import { NotificationRepository as WebNotificationRepository } from './notification.repository.web';
import { NotificationReadRepository } from './notification-read.repository';

jest.mock('@/core/api/axios.instance', () => ({
  apiRequest: jest.fn(),
}));

const apiRequestMock = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe('NotificationRepository por plataforma', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it('Android registra exclusivamente un token Expo android', async () => {
    apiRequestMock.mockResolvedValue(undefined);

    await AndroidNotificationRepository.registerExpoToken(
      'ExponentPushToken[android-token]',
    );

    expect(apiRequestMock).toHaveBeenCalledWith({
      method: 'POST',
      url: '/notifications/register-token',
      data: {
        token: 'ExponentPushToken[android-token]',
        platform: 'android',
        provider: 'EXPO',
      },
    });
  });

  it('Web usa VAPID y no registra tokens Expo', async () => {
    apiRequestMock.mockResolvedValue({ publicKey: 'vapid-public-key' });

    await expect(WebNotificationRepository.getWebPushPublicKey()).resolves.toBe(
      'vapid-public-key',
    );

    expect(apiRequestMock).toHaveBeenCalledWith({
      method: 'GET',
      url: '/notifications/public-key',
    });
    expect('registerExpoToken' in WebNotificationRepository).toBe(false);
  });

  it('ambas plataformas comparten solamente la lectura persistida', async () => {
    apiRequestMock.mockResolvedValue(undefined);

    await NotificationReadRepository.markAsRead('notification-id');

    expect(apiRequestMock).toHaveBeenCalledWith({
      method: 'PATCH',
      url: '/notifications/notification-id/read',
    });
  });
});
