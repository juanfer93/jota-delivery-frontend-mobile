import { useEffect, useMemo, useState, useCallback } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { useDeliveryStore } from '@/features/delivery/application/delivery.store';
import { Pedido, PedidoEstado } from '@/features/delivery/domain/delivery.types';
import { formatColombiaDateTime } from '@/core/time/colombia-time';
import { useAuthStore } from '@/features/auth/application/auth.store';
import { isAdminRole, isDomiciliarioRole } from '@/features/auth/domain/auth.types';
import { DeliveryRepository } from '@/core/repositories/delivery.repository';

const EstadoOpciones = [
  { label: 'En proceso', value: PedidoEstado.EN_PROCESO },
  { label: 'Hecho', value: PedidoEstado.HECHO },
  { label: 'Cancelado', value: PedidoEstado.CANCELADO },
];

function formatMoney(value: number) {
  return Number(value ?? 0).toLocaleString('es-CO');
}

function CourierAvailableOrders() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const loadAvailable = useCallback(async (clearError = true) => {
    setLoading(true);
    if (clearError) setError(null);
    try {
      const data = await DeliveryRepository.getPedidosDisponibles();
      setPedidos(data.filter((pedido) => !pedido.domiciliarioId));
    } catch (loadError: unknown) {
      console.error('[PEDIDOS] No se pudo cargar la lista libre.', loadError);
      setError('No se pudieron cargar los pedidos disponibles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAvailable();
    const interval = setInterval(() => void loadAvailable(), 10000);
    return () => clearInterval(interval);
  }, [loadAvailable]);

  const acceptOrder = async (pedidoId: string) => {
    setAcceptingId(pedidoId);
    setError(null);
    try {
      await DeliveryRepository.tomarPedidoDisponible(pedidoId);
      await loadAvailable();
      router.push('/profile/current-delivery' as any);
    } catch (acceptError: any) {
      const message = acceptError?.response?.data?.message;
      await loadAvailable(false);
      setError(Array.isArray(message) ? message.join(' ') : message || 'Este pedido ya fue asignado.');
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <View>
      <View style={tw`mb-5 rounded-3xl border border-jjBlueDark/10 bg-white p-5`}>
        <Text style={tw`text-xl font-bold text-jjBlueDark`}>Pedidos disponibles</Text>
        <Text style={tw`mt-2 text-sm text-jjBlueDark/60`}>Recoge el primer pedido libre que puedas atender.</Text>
        <TouchableOpacity testID="refresh-available-orders" onPress={() => void loadAvailable()} style={tw`mt-4 rounded-2xl border border-jjBlueDark px-4 py-3`}>
          <Text style={tw`text-center font-bold text-jjBlueDark`}>Actualizar lista</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={tw`items-center justify-center py-16`}>
          <ActivityIndicator size="large" color={tw.color('jj-blue')} />
          <Text style={tw`mt-3 text-jjBlueDark/70`}>Cargando pedidos...</Text>
        </View>
      ) : pedidos.length === 0 ? (
        <View style={tw`items-center justify-center rounded-3xl border border-dashed border-jjBeige bg-white py-12`}>
          <Text style={tw`text-jjBlueDark/70`}>No hay pedidos libres en este momento.</Text>
        </View>
      ) : (
        <View style={tw`gap-4`}>
          {pedidos.map((pedido) => (
            <View key={pedido.id} style={tw`rounded-3xl border border-jjBeige bg-white p-4 shadow-sm`}>
              <Text style={tw`text-base font-bold text-jjBlueDark`}>{pedido.comercio?.nombre ?? `Comercio ${pedido.comercioId}`}</Text>
              <Text style={tw`mt-2 text-sm text-jjBlueDark/70`}>Recoger: {pedido.direccionRecogida || pedido.comercio?.direccion || 'Direccion pendiente'}</Text>
              <Text style={tw`mt-1 text-sm text-jjBlueDark/70`}>Entregar: {pedido.direccionDestino}</Text>
              <Text style={tw`mt-1 text-sm text-jjBlueDark/70`}>Valor: ${formatMoney(pedido.valorFinal)}</Text>
              <Text style={tw`mt-1 text-xs text-jjBlueDark/50`}>Creado: {formatColombiaDateTime(pedido.createdAt)}</Text>
              <TouchableOpacity
                testID={`accept-pedido-${pedido.id}`}
                onPress={() => void acceptOrder(pedido.id)}
                disabled={acceptingId === pedido.id}
                style={tw`mt-4 rounded-2xl bg-jjBlue px-4 py-3 ${acceptingId === pedido.id ? 'opacity-60' : ''}`}
              >
                <Text style={tw`text-center font-bold text-white`}>{acceptingId === pedido.id ? 'Aceptando...' : 'Aceptar pedido'}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {error ? (
        <View style={tw`mt-4 rounded-3xl bg-red-100 border border-red-300 p-4`}>
          <Text style={tw`text-sm text-red-700`}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function DeliveryClient() {
  const router = useRouter();
  const { pedidoId } = useLocalSearchParams<{ pedidoId?: string }>();
  const { pedidosHoy, status, error, refreshPedidosHoy, updateEstado } = useDeliveryStore();
  const user = useAuthStore((state) => state.user);
  const isDomiciliario = isDomiciliarioRole(user?.rol);
  const isAdmin = isAdminRole(user?.rol);
  const [domiciliarioFilter, setDomiciliarioFilter] = useState('');
  const [comercioFilter, setComercioFilter] = useState('');

  useEffect(() => {
    if (isDomiciliario) return;
    void refreshPedidosHoy();
    const interval = setInterval(() => void refreshPedidosHoy(), 15000);
    return () => clearInterval(interval);
  }, [isDomiciliario, refreshPedidosHoy]);

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

      {isDomiciliario ? <CourierAvailableOrders /> : null}

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
                    <Text style={tw`mt-2 text-sm text-jjBlueDark/70`}>Entrega: {pedido.direccionDestino}</Text>
                    <Text style={tw`mt-1 text-sm text-jjBlueDark/70`}>Valor: ${formatMoney(pedido.valorFinal)}</Text>
                    <Text style={tw`mt-1 text-sm text-jjBlueDark/70`}>Estado actual: {pedido.estado}</Text>
                    <Text style={tw`mt-1 text-sm text-jjBlueDark/70`}>Creado: {formatColombiaDateTime(pedido.createdAt)}</Text>
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
