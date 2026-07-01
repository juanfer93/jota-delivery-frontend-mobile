import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import tw from '@/lib/tailwind';
import { DeliveryRepository } from '@/core/repositories/delivery.repository';
import { useAuthStore } from '@/features/auth/application/auth.store';
import { isDomiciliarioRole } from '@/features/auth/domain/auth.types';
import { useDeliveryStore } from '@/features/delivery/application/delivery.store';
import { PedidoEstado } from '@/features/delivery/domain/delivery.types';
import {
  COURIER_AVAILABILITY_COLORS,
  COURIER_AVAILABILITY_LABELS,
  CourierManualAvailability,
  getBackendCourierAvailability,
  MAX_ACTIVE_DELIVERIES_PER_COURIER,
  resolveCourierAvailabilityStatus,
} from '@/features/delivery/domain/courier-availability';
import {
  getNotificationPermissionState,
  NotificationPermissionState,
  requestNotificationPermission,
} from '@/features/notifications/notification.service';

export default function AdminProfileClient() {
  const { user, logout, checkAuth } = useAuthStore();
  const { currentDeliveries, loadCurrentDelivery } = useDeliveryStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermissionState>('undetermined');
  const [isRequestingNotifications, setIsRequestingNotifications] = useState(false);
  const [manualAvailability, setManualAvailability] =
    useState<CourierManualAvailability>('available');
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);

  const isDomiciliario = isDomiciliarioRole(user?.rol);
  const activeDeliveryCount = currentDeliveries.filter(
    (delivery) => delivery.estado === PedidoEstado.EN_PROCESO,
  ).length;
  const isAtDeliveryCapacity = activeDeliveryCount >= MAX_ACTIVE_DELIVERIES_PER_COURIER;
  const availabilityStatus = resolveCourierAvailabilityStatus({
    hasActiveDelivery: isAtDeliveryCapacity,
    backendStatus: getBackendCourierAvailability(user),
    manualStatus: manualAvailability,
  });
  const availabilityLabel = COURIER_AVAILABILITY_LABELS[availabilityStatus];
  const availabilityColor = COURIER_AVAILABILITY_COLORS[availabilityStatus];
  const name =
    user?.nombre || user?.email || (isDomiciliario ? 'Domiciliario' : 'Administrador');
  const gananciaDia = Number(user?.gananciaDia ?? 0);

  const formatCOP = (value: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);

  useFocusEffect(
    useCallback(() => {
      void checkAuth();
    }, [checkAuth]),
  );

  useEffect(() => {
    let active = true;

    void getNotificationPermissionState()
      .then((state) => {
        if (active) setNotificationPermission(state);
      })
      .catch(() => {
        if (active) setNotificationPermission('undetermined');
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isDomiciliario || !user?.id) return undefined;

    const backendStatus = getBackendCourierAvailability(user);
    if (backendStatus === 'available' || backendStatus === 'offline') {
      setManualAvailability(backendStatus);
    } else {
      setManualAvailability('available');
    }

    void loadCurrentDelivery();

    return undefined;
  }, [isDomiciliario, loadCurrentDelivery, user?.id]);

  const handleNotificationToggle = async (enabled: boolean) => {
    if (!enabled || notificationPermission === 'granted') return;

    setIsRequestingNotifications(true);
    const state = await requestNotificationPermission();
    setNotificationPermission(state);
    setIsRequestingNotifications(false);
  };

  const handleAvailabilityToggle = async (enabled: boolean) => {
    if (!user?.id || isAtDeliveryCapacity) return;

    const nextStatus: CourierManualAvailability = enabled ? 'available' : 'offline';
    setManualAvailability(nextStatus);
    setIsSavingAvailability(true);

    try {
      await DeliveryRepository.setCourierAvailability(nextStatus);
      await checkAuth();
    } finally {
      setIsSavingAvailability(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await logout();
      router.replace('/login');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : error;
      console.error('[PROFILE] Error durante logout:', message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-jj-beigeSoft`}>
      <ScrollView contentContainerStyle={tw`p-6 max-w-[800px] w-full self-center`}>
        <View style={tw`mb-8`}>
          <Text style={tw`text-2xl font-bold text-jj-blueDark`}>
            Hola, {name}
          </Text>
          <Text style={tw`text-sm text-jj-blueDark/60`}>
            {isDomiciliario ? 'Panel del domiciliario' : 'Panel de administración'}
          </Text>
          {isDomiciliario ? (
            <Text style={tw`mt-2 text-base font-bold text-jj-blueDark`}>
              Ganancias de hoy: {formatCOP(gananciaDia)}
            </Text>
          ) : null}
        </View>

        <View style={tw`mb-6 rounded-3xl border border-jj-blueDark/10 bg-white p-5`}>
          <Text style={tw`mb-3 font-bold text-jj-blueDark`}>
            Información de cuenta
          </Text>
          <Text style={tw`mb-1 text-jj-blueDark/80`}>Nombre: {name}</Text>
          <Text style={tw`mb-1 text-jj-blueDark/80`}>
            Email: {user?.email || '-'}
          </Text>
          <Text style={tw`text-jj-blueDark/80`}>Rol: {user?.rol || '-'}</Text>
        </View>

        <View style={tw`mb-6 rounded-3xl border border-jj-blueDark/10 bg-white p-5`}>
          <Text style={tw`mb-4 text-lg font-bold text-jj-blueDark`}>
            Opciones
          </Text>
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-1 pr-4`}>
              <Text style={tw`text-base font-semibold text-jj-blueDark`}>
                Permitir notificaciones
              </Text>
              {notificationPermission === 'denied' ? (
                <Text style={tw`mt-1 text-xs text-red-600`}>
                  Permiso bloqueado. Activalo desde ajustes del dispositivo.
                </Text>
              ) : null}
              {notificationPermission === 'unsupported' ? (
                <Text style={tw`mt-1 text-xs text-jj-blueDark/60`}>
                  Este dispositivo no soporta notificaciones push.
                </Text>
              ) : null}
            </View>
            {isRequestingNotifications ? (
              <ActivityIndicator color="#174A8B" />
            ) : (
              <Switch
                testID="notifications-permission-switch"
                value={notificationPermission === 'granted'}
                disabled={notificationPermission === 'unsupported'}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#CBD5E1', true: '#174A8B' }}
                thumbColor="#FFFFFF"
              />
            )}
          </View>

          {isDomiciliario ? (
            <View style={tw`mt-5 border-t border-jj-blueDark/10 pt-5`}>
              <View style={tw`mb-4 flex-row items-center justify-between`}>
                <View style={tw`flex-1 pr-4`}>
                  <View style={tw`mb-1 flex-row items-center`}>
                    <View
                      style={[
                        tw`mr-2 h-3 w-3 rounded-full`,
                        { backgroundColor: availabilityColor },
                      ]}
                    />
                    <Text style={tw`text-base font-semibold text-jjBlueDark`}>
                      Estado: {availabilityLabel}
                    </Text>
                  </View>
                  <Text style={tw`text-xs text-jjBlueDark/60`}>
                    {isAtDeliveryCapacity
                      ? `Se marca ocupado automaticamente cuando tienes ${MAX_ACTIVE_DELIVERIES_PER_COURIER} pedidos en transito.`
                      : 'Activa o desactiva tu disponibilidad para recibir pedidos.'}
                  </Text>
                </View>
                {isSavingAvailability ? (
                  <ActivityIndicator color="#174A8B" />
                ) : (
                  <Switch
                    testID="courier-availability-switch"
                    value={manualAvailability === 'available' && !isAtDeliveryCapacity}
                    disabled={isAtDeliveryCapacity}
                    onValueChange={handleAvailabilityToggle}
                    trackColor={{ false: '#EF4444', true: '#22C55E' }}
                    thumbColor="#FFFFFF"
                  />
                )}
              </View>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          testID="change-password-button"
          onPress={() => router.push('/(app)/profile/change-password' as any)}
          style={tw`mb-4 rounded-2xl bg-jjBlue p-4 shadow-lg`}
        >
          <Text style={tw`text-center text-base font-bold text-white`}>
            Cambiar contraseña
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          disabled={isLoggingOut}
          style={tw`rounded-2xl bg-red-500 p-4 shadow-lg ${isLoggingOut ? 'opacity-70' : ''
            }`}
        >
          {isLoggingOut ? (
            <View style={tw`flex-row items-center justify-center`}>
              <ActivityIndicator color="white" />
              <Text style={tw`ml-3 text-center text-base font-bold text-white`}>
                Cerrando sesión...
              </Text>
            </View>
          ) : (
            <Text style={tw`text-center text-base font-bold text-white`}>
              Cerrar Sesión
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
