import { NotificationPayload } from './domain/notification.types';

export type NotificationOpenedHandler = (payload: NotificationPayload) => void;

export function initializeNotifications(
  onOpened: NotificationOpenedHandler,
): Promise<() => void>;
