import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { NotificationRepository } from './infrastructure/notification.repository.android';
import { NotificationPayload, parseNotificationPayload } from './domain/notification.types';

export type NotificationOpenedHandler = (payload: NotificationPayload) => void;

const ORDERS_CHANNEL_ID = 'orders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function forwardResponse(
  response: Notifications.NotificationResponse | null,
  onOpened: NotificationOpenedHandler,
) {
  const payload = parseNotificationPayload(response?.notification.request.content.data);
  if (payload) onOpened(payload);
}

async function registerAndroidToken(): Promise<void> {
  await Notifications.setNotificationChannelAsync(ORDERS_CHANNEL_ID, {
    name: 'Pedidos',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#174A8B',
  });

  if (!Device.isDevice) {
    console.info('[NOTIFICATIONS] Expo Push requiere un dispositivo Android fisico.');
    return;
  }

  const current = await Notifications.getPermissionsAsync();
  const permission = current.status === 'granted'
    ? current.status
    : (await Notifications.requestPermissionsAsync()).status;

  if (permission !== 'granted') {
    console.info('[NOTIFICATIONS] El usuario no concedio permisos de notificacion.');
    return;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    console.error('[NOTIFICATIONS] No se encontro el projectId de EAS en app.json.');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  await NotificationRepository.registerExpoToken(token);
}

export async function initializeNotifications(
  onOpened: NotificationOpenedHandler,
): Promise<() => void> {
  try {
    await registerAndroidToken();
  } catch (error: unknown) {
    console.error('[NOTIFICATIONS] No se pudo registrar el dispositivo Android.', error);
  }

  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    forwardResponse(response, onOpened);
  });
  const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    const payload = parseNotificationPayload(notification.request.content.data);
    if (payload) onOpened(payload);
  });

  try {
    const lastResponse = await Notifications.getLastNotificationResponseAsync();
    forwardResponse(lastResponse, onOpened);
    if (lastResponse) await Notifications.clearLastNotificationResponseAsync();
  } catch (error: unknown) {
    console.error('[NOTIFICATIONS] No se pudo leer la ultima notificacion.', error);
  }

  return () => {
    responseSubscription.remove();
    receivedSubscription.remove();
  };
}
