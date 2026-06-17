import { NotificationPayload, parseNotificationPayload } from './domain/notification.types';
import {
  NotificationRepository,
  WebPushSubscriptionInput,
} from './infrastructure/notification.repository.web';

export type NotificationOpenedHandler = (payload: NotificationPayload) => void;

const WEB_NOTIFICATION_SOUND_URL = '/sounds/jota-notification.mp3';

function playNotificationSound(): void {
  try {
    const audio = new Audio(WEB_NOTIFICATION_SOUND_URL);
    audio.currentTime = 0;
    void audio.play().catch((error: unknown) => {
      console.info('[NOTIFICATIONS] El navegador bloqueo el sonido personalizado.', error);
    });
  } catch (error: unknown) {
    console.info('[NOTIFICATIONS] No se pudo reproducir el sonido personalizado web.', error);
  }
}

function base64UrlToUint8Array(value: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const decoded = window.atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(decoded.length));

  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index);
  }

  return bytes;
}

function toSubscriptionInput(subscription: PushSubscription): WebPushSubscriptionInput | null {
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) return null;

  return {
    endpoint: json.endpoint,
    expirationTime: json.expirationTime ?? null,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
  };
}

function readPayloadFromUrl(): NotificationPayload | null {
  const url = new URL(window.location.href);
  const pedidoId = url.searchParams.get('notificationPedidoId');
  if (!pedidoId) return null;

  const payload = parseNotificationPayload({
    pedidoId,
    notificationId: url.searchParams.get('notificationId'),
    type: url.searchParams.get('notificationType'),
    estado: url.searchParams.get('notificationStatus'),
    domiciliarioNombre: url.searchParams.get('deliveryName'),
    createdAt: url.searchParams.get('notificationCreatedAt'),
  });

  url.searchParams.delete('notificationPedidoId');
  url.searchParams.delete('notificationId');
  url.searchParams.delete('notificationType');
  url.searchParams.delete('notificationStatus');
  url.searchParams.delete('deliveryName');
  url.searchParams.delete('notificationCreatedAt');
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);

  return payload;
}

async function registerWebPush(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.info('[NOTIFICATIONS] Este navegador no soporta Web Push.');
    return;
  }

  const permission = window.Notification.permission === 'default'
    ? await window.Notification.requestPermission()
    : window.Notification.permission;

  if (permission !== 'granted') {
    console.info('[NOTIFICATIONS] El usuario no concedio permisos de notificacion.');
    return;
  }

  const registration = await navigator.serviceWorker.register('/jota-notifications-sw.js');
  const publicKey = await NotificationRepository.getWebPushPublicKey();
  const existing = await registration.pushManager.getSubscription();
  const subscription = existing ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlToUint8Array(publicKey),
  });
  const input = toSubscriptionInput(subscription);

  if (!input) throw new Error('La suscripcion Web Push no contiene llaves validas.');
  await NotificationRepository.subscribeWebPush(input);
}

export async function initializeNotifications(
  onOpened: NotificationOpenedHandler,
): Promise<() => void> {
  try {
    await registerWebPush();
  } catch (error: unknown) {
    console.error('[NOTIFICATIONS] No se pudo registrar Web Push.', error);
  }

  const initialPayload = readPayloadFromUrl();
  if (initialPayload) onOpened(initialPayload);

  const handleMessage = (event: MessageEvent<unknown>) => {
    const payload = parseNotificationPayload(event.data);
    if (payload) {
      playNotificationSound();
      onOpened(payload);
    }
  };

  navigator.serviceWorker?.addEventListener('message', handleMessage);
  return () => navigator.serviceWorker?.removeEventListener('message', handleMessage);
}
