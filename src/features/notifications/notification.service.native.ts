import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationRepository } from './infrastructure/notification.repository';
import { NotificationPayload, parseNotificationPayload } from './domain/notification.types';

export type NotificationOpenedHandler = (payload: NotificationPayload) => void;

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

async function registerDeviceToken(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Pedidos',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#174A8B',
    });
  }

  if (!Device.isDevice) {
    console.info('[NOTIFICATIONS] El Push movil requiere un dispositivo fisico.');
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
    await registerDeviceToken();
  } catch (error: unknown) {
    console.error('[NOTIFICATIONS] No se pudo registrar el dispositivo movil.', error);
  }

  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    forwardResponse(response, onOpened);
  });

  try {
    forwardResponse(await Notifications.getLastNotificationResponseAsync(), onOpened);
  } catch (error: unknown) {
    console.error('[NOTIFICATIONS] No se pudo leer la ultima notificacion.', error);
  }

  return () => responseSubscription.remove();
}
