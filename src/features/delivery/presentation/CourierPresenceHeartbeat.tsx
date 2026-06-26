import { useCallback } from 'react';
import { DeliveryRepository } from '@/core/repositories/delivery.repository';
import { useAuthStore } from '@/features/auth/application/auth.store';
import { isDomiciliarioRole } from '@/features/auth/domain/auth.types';
import { getBackendCourierAvailability } from '@/features/delivery/domain/courier-availability';
import { useDeliveryPolling } from './useDeliveryPolling';

export function CourierPresenceHeartbeat() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const isDomiciliario = isDomiciliarioRole(user?.rol);
  const availability = getBackendCourierAvailability(user);
  const shouldHeartbeat = isAuthenticated && isDomiciliario && availability !== 'offline';

  const heartbeat = useCallback(async () => {
    await DeliveryRepository.touchCourierPresence().catch((error: unknown) => {
      console.error('[DOMICILIARIOS] No se pudo actualizar presencia.', error);
    });
  }, []);

  useDeliveryPolling(heartbeat, 30000, shouldHeartbeat);

  return null;
}
