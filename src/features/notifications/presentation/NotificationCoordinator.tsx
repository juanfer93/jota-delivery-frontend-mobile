import { PropsWithChildren, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/application/auth.store';
import { initializeNotifications } from '../notification.service';
import { useNotificationStore } from '../application/notification.store';
import { NotificationPedidoModal } from './NotificationPedidoModal';
import { NotificationPayload } from '../domain/notification.types';
import { getNotificationRoute } from '../application/notification-navigation';

export function NotificationCoordinator({ children }: PropsWithChildren) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.id);
  const openNotification = useNotificationStore((state) => state.openNotification);
  const handleNotification = useCallback((payload: NotificationPayload) => {
    openNotification(payload);
    router.push(getNotificationRoute(payload) as never);
  }, [openNotification, router]);

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
