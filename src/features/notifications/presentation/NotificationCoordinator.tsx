import { PropsWithChildren, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/application/auth.store';
import { initializeNotifications } from '../notification.service';
import { useNotificationStore } from '../application/notification.store';
import { NotificationPedidoModal } from './NotificationPedidoModal';
import { NotificationPayload } from '../domain/notification.types';

export function NotificationCoordinator({ children }: PropsWithChildren) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.id);
  const openNotification = useNotificationStore((state) => state.openNotification);

  const handleNotification = useCallback((payload: NotificationPayload) => {
    openNotification(payload);
  }, [openNotification]);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    let cleanup: (() => void) | undefined;
    let active = true;
    void initializeNotifications(handleNotification).then((unsubscribe) => {
      if (active) cleanup = unsubscribe;
      else unsubscribe();
    });

    return () => {
      active = false;
      cleanup?.();
    };
  }, [handleNotification, isAuthenticated, userId]);

  return (
    <>
      {children}
      <NotificationPedidoModal />
    </>
  );
}
