import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { useDeliveryStore } from '@/features/delivery/application/delivery.store';
import { PedidoEstado } from '@/features/delivery/domain/delivery.types';
import { useAuthStore } from '@/features/auth/application/auth.store';
import { isAdminRole, isDomiciliarioRole } from '@/features/auth/domain/auth.types';
import { CourierAvailableOrders } from './CourierAvailableOrders';
import { CourierCurrentDeliveryShortcut } from './CourierCurrentDeliveryShortcut';
import { formatMoney, formatRouteSummary } from './delivery.utils';
import { useDeliveryPolling } from './useDeliveryPolling';
import {
  getBackendCourierAvailability,
  MAX_ACTIVE_DELIVERIES_PER_COURIER,
} from '@/features/delivery/domain/courier-availability';

const EstadoOpciones = [
  { label: 'En proceso', value: PedidoEstado.EN_PROCESO },
  { label: 'Hecho', value: PedidoEstado.HECHO },
  { label: 'Cancelado', value: PedidoEstado.CANCELADO },
];

export function DeliveryClient() {
  const router = useRouter();
  const { pedidoId } = useLocalSearchParams<{ pedidoId?: string }>();
  const {
    pedidosHoy,
    status,
    error,
    currentDelivery,
    currentDeliveries,
    refreshPedidosHoy,
    loadCurrentDelivery,
    updateEstado,
  } = useDeliveryStore();
  const user = useAuthStore((state) => state.user);
  const isDomiciliario = isDomiciliarioRole(user?.rol);
  const isAdmin = isAdminRole(user?.rol);
  const [domiciliarioFilter, setDomiciliarioFilter] = useState('');
  const [comercioFilter, setComercioFilter] = useState('');
  const backendAvailability = getBackendCourierAvailability(user);
  const activeDeliveryCount = currentDeliveries.filter(
    (delivery) => delivery.estado === PedidoEstado.EN_PROCESO,
  ).length;
  const isAtDeliveryCapacity = activeDeliveryCount >= MAX_ACTIVE_DELIVERIES_PER_COURIER;
  const isCourierAvailable = !isDomiciliario || (backendAvailability !== 'offline' && !isAtDeliveryCapacity);

  useDeliveryPolling(refreshPedidosHoy, 60000, !isDomiciliario);
  useDeliveryPolling(loadCurrentDelivery, 45000, isDomiciliario);

  const pedidosPorDomiciliario = useMemo(() => {
    const map = new Map<string, typeof pedidosHoy>();
    const normalizedDomiciliario = domiciliarioFilter.trim().toLocaleLowerCase('es-CO');
    const normalizedComercio = comercioFilter.trim().toLocaleLowerCase('es-CO');
    const filteredPedidos = pedidosHoy.filter((pedido) => {
      const domiciliario = pedido.usuario?.nombre?.toLocaleLowerCase('es-CO') ?? 'sin domiciliario';
      const comercio = pedido.comercio?.nombre?.toLocaleLowerCase('es-CO') ?? '';

      return (!normalizedDomiciliario || domiciliario.includes(normalizedDomiciliario))
        && (!normalizedComercio || comercio.includes(normalizedComercio));
    });

    filteredPedidos.forEach((pedido) => {
      const key = pedido.usuario?.nombre ?? 'Sin domiciliario';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(pedido);
    });
    return Array.from(map.entries());
  }, [comercioFilter, domiciliarioFilter, pedidosHoy]);

  const handleChangeEstado = async (id: string, nuevoEstado: PedidoEstado) => {
    await updateEstado(id, nuevoEstado, { refresh: 'admin' });
  };

  return (
    <ScrollView style={tw`flex-1 bg-jjBeigeSoft`} contentContainerStyle={tw`p-6`}>
      <View style={tw`mb-6`}>
        <Text style={tw`text-3xl font-bold text-jjBlueDark`}>Pedidos</Text>
        <Text style={tw`text-sm text-jjBlueDark/60 mt-2`}>
          {isDomiciliario ? 'Lista de pedidos libres para aceptar.' : 'Administra las ordenes y asignaciones por domiciliario.'}
        </Text>
      </View>

      {isDomiciliario ? (
        <>
          <CourierCurrentDeliveryShortcut
            currentDelivery={currentDelivery}
            currentDeliveries={currentDeliveries}
            onPress={() => router.push('/(app)/delivery/current-delivery' as any)}
          />
          <CourierAvailableOrders
            isCourierAvailable={isCourierAvailable}
            unavailableReason={isAtDeliveryCapacity ? 'capacity' : 'offline'}
          />
        </>
      ) : null}

      {!isDomiciliario ? (
        <>
          <View style={tw`mb-5 flex-row gap-3`}>
            {isAdmin ? (
              <TouchableOpacity
                testID="btn-crear-pedido"
                onPress={() => router.push('/delivery/create')}
                style={tw`flex-1 rounded-3xl bg-jjBlueDark px-4 py-3`}
              >
                <Text style={tw`text-center text-sm font-bold text-white`}>Crear pedido</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              testID="btn-historial-pedidos"
              onPress={() => router.push('/delivery/history')}
              style={tw`flex-1 rounded-3xl border border-jjBlueDark bg-white px-4 py-3`}
            >
              <Text style={tw`text-center text-sm font-bold text-jjBlueDark`}>Historial</Text>
            </TouchableOpacity>
          </View>

          {isAdmin ? (
            <View style={tw`mb-5 rounded-3xl border border-jjBeige bg-white p-4`}>
              <Text style={tw`mb-3 text-sm font-bold text-jjBlueDark`}>Filtrar pedidos</Text>
              <TextInput testID="filter-pedidos-domiciliario" value={domiciliarioFilter} onChangeText={setDomiciliarioFilter} placeholder="Buscar por domiciliario" placeholderTextColor="#718096" style={tw`mb-3 rounded-2xl border border-jjBeige bg-jjBeigeSoft px-4 py-3 text-sm text-jjBlueDark`} />
              <TextInput testID="filter-pedidos-comercio" value={comercioFilter} onChangeText={setComercioFilter} placeholder="Buscar por comercio" placeholderTextColor="#718096" style={tw`rounded-2xl border border-jjBeige bg-jjBeigeSoft px-4 py-3 text-sm text-jjBlueDark`} />
            </View>
          ) : null}

          {status === 'loading' ? (
            <View style={tw`items-center justify-center py-16`}>
              <ActivityIndicator size="large" color={tw.color('jj-blue')} />
              <Text style={tw`mt-3 text-jjBlueDark/70`}>Cargando pedidos...</Text>
            </View>
          ) : pedidosHoy.length === 0 ? (
            <View style={tw`items-center justify-center py-16`}>
              <Text style={tw`text-jjBlueDark/70`}>No hay pedidos activos o finalizados recientemente.</Text>
            </View>
          ) : pedidosPorDomiciliario.length === 0 ? (
            <View style={tw`items-center justify-center rounded-3xl border border-dashed border-jjBeige bg-white py-12`}>
              <Text style={tw`text-jjBlueDark/70`}>No hay pedidos que coincidan con los filtros.</Text>
            </View>
          ) : (
            pedidosPorDomiciliario.map(([domiciliario, items]) => (
              <View key={domiciliario} style={tw`mb-4 rounded-3xl border border-jjBeige bg-white p-4 shadow-sm`}>
                <View style={tw`mb-4 flex-row items-center justify-between`}>
                  <Text style={tw`text-base font-bold text-jjBlueDark`}>{domiciliario}</Text>
                  <Text style={tw`text-xs text-jjBlueDark/60`}>{items.length} pedido(s)</Text>
                </View>
                {items.map((pedido) => (
                  <View key={pedido.id} style={tw`mb-4 rounded-3xl border ${pedidoId === pedido.id ? 'border-jjBlueDark' : 'border-jjBeige'} bg-jjBeigeSoft p-4`}>
                    <Text style={tw`text-sm font-bold text-jjBlueDark`}>{pedido.comercio?.nombre ?? `Comercio ${pedido.comercioId}`}</Text>
                    <Text style={tw`mt-2 text-sm font-semibold leading-5 text-jjBlueDark/80`}>{formatRouteSummary(pedido)}</Text>
                    <Text style={tw`mt-1 text-sm text-jjBlueDark/70`}>Valor: ${formatMoney(pedido.valorFinal)}</Text>
                    {pedido.clienteNombre ? (
                      <Text style={tw`mt-1 text-sm text-jjBlueDark/70`}>Cliente: {pedido.clienteNombre}</Text>
                    ) : null}
                    {pedido.clienteTelefono ? (
                      <Text style={tw`mt-1 text-sm text-jjBlueDark/70`}>Telefono: {pedido.clienteTelefono}</Text>
                    ) : null}
                    {pedido.detallesAdicionales ? (
                      <Text style={tw`mt-1 text-sm text-jjBlueDark/70`}>Detalles: {pedido.detallesAdicionales}</Text>
                    ) : null}
                    <Text style={tw`mt-1 text-sm text-jjBlueDark/70`}>Estado actual: {pedido.estado}</Text>
                    <View style={tw`mt-4 flex-row flex-wrap gap-2`}>
                      {EstadoOpciones.map((option) => {
                        const active = option.value === pedido.estado;
                        const finalizado = pedido.estado === PedidoEstado.HECHO || pedido.estado === PedidoEstado.CANCELADO;
                        return (
                          <TouchableOpacity key={option.value} testID={`pedido-${pedido.id}-estado-${option.value}`} onPress={() => handleChangeEstado(pedido.id.toString(), option.value)} disabled={finalizado || active} style={tw`rounded-full px-3 py-2 ${finalizado || active ? 'bg-jjBlueDark/20' : 'bg-jjBlueDark'}`}>
                            <Text style={tw`text-xs font-semibold text-jjBeige`}>{option.label}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}
        </>
      ) : null}

      {error && (
        <View style={tw`mt-4 rounded-3xl bg-red-100 border border-red-300 p-4`}>
          <Text style={tw`text-sm text-red-700`}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
}
