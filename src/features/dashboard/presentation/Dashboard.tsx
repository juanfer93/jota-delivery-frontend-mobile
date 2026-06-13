import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import tw from '@/lib/tailwind';
import { useDeliveryStore } from '@/features/delivery/application/delivery.store';
import { EntityPreviewCard } from './components/EntityPreviewCard';
import { formatColombiaDateTime } from '@/core/time/colombia-time';
import { DeliveryRepository } from '@/core/repositories/delivery.repository';

export default function Dashboard() {
  const {
    domiciliarios = [], comercios = [], loadData, status, error,
    blockingDomiciliarioId, toggleDomiciliarioBloqueo,
  } = useDeliveryStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <ScrollView style={tw`flex-1 bg-jjBeigeSoft`} contentContainerStyle={tw`p-6 pb-10`}>
      <View style={tw`mb-7`}>
        <Text style={tw`text-3xl font-bold text-jjBlueDark`}>Inicio</Text>
        <Text style={tw`mt-2 text-sm text-jjBlueDark/60`}>
          Gestiona tu operación desde un solo lugar.
        </Text>
      </View>

      <TouchableOpacity
        testID="btn-nav-crear-pedido"
        style={tw`mb-4 rounded-3xl bg-jjBlueDark px-5 py-5 shadow-lg`}
        onPress={() => router.push('/delivery/create')}
      >
        <Text style={tw`text-xs font-bold uppercase tracking-widest text-jjBeige`}>Pedidos</Text>
        <Text style={tw`mt-1 text-xl font-bold text-white`}>Nuevo Pedido</Text>
      </TouchableOpacity>

      <View style={tw`mb-7 flex-row gap-3`}>
        <TouchableOpacity
          testID="btn-nav-crear-domiciliario"
          style={tw`flex-1 rounded-3xl border border-jjBlueDark bg-white px-3 py-4`}
          onPress={() => router.push('/domiciliarios/create')}
        >
          <Text style={tw`text-center text-sm font-bold text-jjBlueDark`}>Crear domiciliario</Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="btn-nav-crear-comercio"
          style={tw`flex-1 rounded-3xl border border-jjBlueDark bg-white px-3 py-4`}
          onPress={() => router.push('/comercios/create')}
        >
          <Text style={tw`text-center text-sm font-bold text-jjBlueDark`}>Crear comercio</Text>
        </TouchableOpacity>
      </View>

      <Text style={tw`mb-4 text-xl font-bold text-jjBlueDark`}>Directorio</Text>

      {status === 'loading' ? (
        <View style={tw`items-center rounded-3xl bg-white py-10`}>
          <ActivityIndicator size="large" color={tw.color('jj-blue')} />
          <Text style={tw`mt-3 text-sm text-jjBlueDark/60`}>Cargando directorio...</Text>
        </View>
      ) : (
        <>
          <EntityPreviewCard
            title="Domiciliarios"
            emptyMessage="Aún no hay domiciliarios registrados."
            onSearch={async (query) => (await DeliveryRepository.searchDomiciliarios(query)).map((item) => ({
              id: item.id,
              name: item.nombre,
              detail: item.email,
              badge: item.bloqueado ? 'Bloqueado' : 'Activo',
            }))}
            items={domiciliarios.map((item) => ({
              id: item.id,
              name: item.nombre,
              detail: item.email,
              meta: item.createdAt
                ? `Creado: ${formatColombiaDateTime(item.createdAt)}`
                : undefined,
              badge: item.bloqueado ? 'Bloqueado' : 'Activo',
              actionLabel: item.bloqueado ? 'Desbloquear' : 'Bloquear',
              actionDisabled: blockingDomiciliarioId === item.id,
              onAction: () => void toggleDomiciliarioBloqueo(item.id, !item.bloqueado),
            }))}
          />
          <EntityPreviewCard
            title="Comercios"
            emptyMessage="Aún no hay comercios registrados."
            onSearch={async (query) => (await DeliveryRepository.searchComercios(query)).map((item) => ({
              id: item.id,
              name: item.nombre,
              detail: item.direccion,
            }))}
            items={comercios.map((item) => ({ id: item.id, name: item.nombre, detail: item.direccion }))}
          />
        </>
      )}

      {error ? (
        <View style={tw`rounded-3xl border border-red-300 bg-red-100 p-4`}>
          <Text style={tw`text-sm text-red-700`}>{error}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
