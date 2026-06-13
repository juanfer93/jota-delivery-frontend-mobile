import { PropsWithChildren, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/application/auth.store';
import { initializeNotifications } from '../notification.service';
import { useNotificationStore } from '../application/notification.store';
import { NotificationPedidoModal } from './NotificationPedidoModal';

export function NotificationCoordinator({ children }: PropsWithChildren) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.id);
  const openNotification = useNotificationStore((state) => state.openNotification);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    let cleanup: (() => void) | undefined;
    let active = true;
    void initializeNotifications(openNotification).then((unsubscribe) => {
      if (active) cleanup = unsubscribe;
      else unsubscribe();
    });

    return () => {
      active = false;
      cleanup?.();
    };
  }, [isAuthenticated, openNotification, userId]);

  return (
    <>
      {children}
      <NotificationPedidoModal />
    </>
  );
}
