import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import tw from '@/lib/tailwind';
import { useAuthStore } from '@/features/auth/application/auth.store';
import DashboardClient from '@/features/dashboard/presentation/Dashboard';
import { isDomiciliarioRole } from '@/features/auth/domain/auth.types';
import { DeliveryRepository } from '@/core/repositories/delivery.repository';
import { PedidoEstado } from '@/features/delivery/domain/delivery.types';

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const isDomiciliario = isDomiciliarioRole(user?.rol);
  const [domiciliarioRoute, setDomiciliarioRoute] = useState<string | null>(null);

  useEffect(() => {
    if (!isDomiciliario) {
      setDomiciliarioRoute(null);
      return;
    }

    let active = true;

    void DeliveryRepository.getCurrentDelivery()
      .then((pedido) => {
        if (!active) return;
        setDomiciliarioRoute(
          pedido?.estado === PedidoEstado.EN_PROCESO
            ? '/profile/current-delivery'
            : '/delivery',
        );
      })
      .catch(() => {
        if (active) setDomiciliarioRoute('/delivery');
      });

    return () => {
      active = false;
    };
  }, [isDomiciliario]);

  if (isDomiciliario) {
    if (!domiciliarioRoute) {
      return (
        <View style={tw`flex-1 items-center justify-center bg-jjBeigeSoft`}>
          <ActivityIndicator size="large" color={tw.color('jj-blue')} />
        </View>
      );
    }

    return <Redirect href={domiciliarioRoute as any} />;
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <DashboardClient />
    </View>
  );
}
