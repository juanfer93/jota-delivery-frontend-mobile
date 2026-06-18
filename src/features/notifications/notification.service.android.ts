import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { NotificationRepository } from './infrastructure/notification.repository.android';
import { NotificationPayload, parseNotificationPayload } from './domain/notification.types';

export type NotificationOpenedHandler = (payload: NotificationPayload) => void;
export type NotificationPermissionState =
  | 'granted'
  | 'denied'
  | 'undetermined'
  | 'unsupported';

const ORDERS_CHANNEL_ID = 'orders-v3';
const LEGACY_ORDERS_CHANNEL_ID = 'orders-v2';
const ORDERS_NOTIFICATION_SOUND = 'jota_notification.mp3';

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

async function configureAndroidChannels(): Promise<void> {
  await Notifications.deleteNotificationChannelAsync(LEGACY_ORDERS_CHANNEL_ID).catch(() => undefined);
  await Notifications.setNotificationChannelAsync(ORDERS_CHANNEL_ID, {
    name: 'Pedidos',
    description: 'Notificaciones de pedidos y cambios de estado.',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#174A8B',
    sound: ORDERS_NOTIFICATION_SOUND,
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

function mapPermissionStatus(status: string): NotificationPermissionState {
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

async function registerAndroidToken(shouldRequestPermission: boolean): Promise<NotificationPermissionState> {
  await configureAndroidChannels();

  if (!Device.isDevice) {
    console.info('[NOTIFICATIONS] Expo Push requiere un dispositivo Android fisico.');
    return 'unsupported';
  }

  const current = await Notifications.getPermissionsAsync();
  const finalPermission = shouldRequestPermission && current.status !== 'granted'
    ? (await Notifications.requestPermissionsAsync()).status
    : current.status;

  if (finalPermission !== 'granted') {
    console.info('[NOTIFICATIONS] El usuario no concedio permisos de notificacion.');
    return mapPermissionStatus(finalPermission);
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    console.error('[NOTIFICATIONS] No se encontro el projectId de EAS en app.json.');
    return 'unsupported';
  }

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  await NotificationRepository.registerExpoToken(token);
  console.info('[NOTIFICATIONS] Token Expo registrado correctamente.');
  return 'granted';
}

export async function getNotificationPermissionState(): Promise<NotificationPermissionState> {
  if (!Device.isDevice) return 'unsupported';
  const current = await Notifications.getPermissionsAsync();
  return mapPermissionStatus(current.status);
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  try {
    return await registerAndroidToken(true);
  } catch (error: unknown) {
    console.error('[NOTIFICATIONS] No se pudo solicitar permisos Android.', error);
    return 'denied';
  }
}

export async function initializeNotifications(
  onOpened: NotificationOpenedHandler,
): Promise<() => void> {
  try {
    await registerAndroidToken(false);
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
