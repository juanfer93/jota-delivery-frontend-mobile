import { NotificationPayload } from './domain/notification.types';

export type NotificationOpenedHandler = (payload: NotificationPayload) => void;
export type NotificationPermissionState =
  | 'granted'
  | 'denied'
  | 'undetermined'
  | 'unsupported';

export function initializeNotifications(
  onOpened: NotificationOpenedHandler,
): Promise<() => void>;

export function getNotificationPermissionState(): Promise<NotificationPermissionState>;

export function requestNotificationPermission(): Promise<NotificationPermissionState>;
