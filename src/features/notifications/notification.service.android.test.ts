const mockDeleteNotificationChannelAsync = jest.fn();
const mockSetNotificationChannelAsync = jest.fn();
const mockGetPermissionsAsync = jest.fn();
const mockRequestPermissionsAsync = jest.fn();
const mockGetExpoPushTokenAsync = jest.fn();
const mockAddNotificationResponseReceivedListener = jest.fn();
const mockAddNotificationReceivedListener = jest.fn();
const mockGetLastNotificationResponseAsync = jest.fn();
const mockClearLastNotificationResponseAsync = jest.fn();
const mockRegisterExpoToken = jest.fn();

jest.mock('expo-device', () => ({
  isDevice: true,
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      eas: {
        projectId: 'test-project-id',
      },
    },
  },
  easConfig: null,
}));

jest.mock('expo-notifications', () => ({
  AndroidImportance: {
    MAX: 'max',
  },
  AndroidNotificationVisibility: {
    PUBLIC: 'public',
  },
  setNotificationHandler: jest.fn(),
  deleteNotificationChannelAsync: (...args: unknown[]) =>
    mockDeleteNotificationChannelAsync(...args),
  setNotificationChannelAsync: (...args: unknown[]) =>
    mockSetNotificationChannelAsync(...args),
  getPermissionsAsync: (...args: unknown[]) => mockGetPermissionsAsync(...args),
  requestPermissionsAsync: (...args: unknown[]) =>
    mockRequestPermissionsAsync(...args),
  getExpoPushTokenAsync: (...args: unknown[]) =>
    mockGetExpoPushTokenAsync(...args),
  addNotificationResponseReceivedListener: (...args: unknown[]) =>
    mockAddNotificationResponseReceivedListener(...args),
  addNotificationReceivedListener: (...args: unknown[]) =>
    mockAddNotificationReceivedListener(...args),
  getLastNotificationResponseAsync: (...args: unknown[]) =>
    mockGetLastNotificationResponseAsync(...args),
  clearLastNotificationResponseAsync: (...args: unknown[]) =>
    mockClearLastNotificationResponseAsync(...args),
}));

jest.mock('./infrastructure/notification.repository.android', () => ({
  NotificationRepository: {
    registerExpoToken: (...args: unknown[]) => mockRegisterExpoToken(...args),
  },
}));

describe('notification.service.android', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.requireMock('expo-device').isDevice = true;
    mockDeleteNotificationChannelAsync.mockResolvedValue(undefined);
    mockSetNotificationChannelAsync.mockResolvedValue(undefined);
    mockGetPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockGetExpoPushTokenAsync.mockResolvedValue({
      data: 'ExponentPushToken[android-token]',
    });
    mockRegisterExpoToken.mockResolvedValue(undefined);
    mockAddNotificationResponseReceivedListener.mockReturnValue({
      remove: jest.fn(),
    });
    mockAddNotificationReceivedListener.mockReturnValue({
      remove: jest.fn(),
    });
    mockGetLastNotificationResponseAsync.mockResolvedValue(null);
    mockClearLastNotificationResponseAsync.mockResolvedValue(undefined);
  });

  it('pide permiso y registra el token Android durante la primera sesion', async () => {
    const { initializeNotifications } = require('./notification.service.android') as typeof import('./notification.service.android');

    await initializeNotifications(jest.fn());

    expect(mockRequestPermissionsAsync).toHaveBeenCalled();
    expect(mockGetExpoPushTokenAsync).toHaveBeenCalledWith({
      projectId: 'test-project-id',
    });
    expect(mockRegisterExpoToken).toHaveBeenCalledWith(
      'ExponentPushToken[android-token]',
    );
    expect(mockDeleteNotificationChannelAsync).toHaveBeenCalledWith('orders-v2');
    expect(mockDeleteNotificationChannelAsync).toHaveBeenCalledWith('orders-v3');
    expect(mockSetNotificationChannelAsync).toHaveBeenCalledWith('orders-v4', expect.objectContaining({
      importance: 'max',
      sound: 'jota_notifications.mp3',
      vibrationPattern: [0, 900, 250, 900, 250, 900, 250, 900, 250, 900, 250, 900],
    }));
  });

  it('no insiste si el usuario ya rechazo los permisos', async () => {
    mockGetPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    const { initializeNotifications } = require('./notification.service.android') as typeof import('./notification.service.android');

    await initializeNotifications(jest.fn());

    expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
    expect(mockGetExpoPushTokenAsync).not.toHaveBeenCalled();
    expect(mockRegisterExpoToken).not.toHaveBeenCalled();
  });
});
