import { useCallback, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { DeliveryRepository } from '@/core/repositories/delivery.repository';
import { Pedido } from '@/features/delivery/domain/delivery.types';
import { formatColombiaDateTime } from '@/core/time/colombia-time';
import { formatMoney } from './delivery.utils';
import { useDeliveryPolling } from './useDeliveryPolling';

export function CourierAvailableOrders() {
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

  useDeliveryPolling(loadAvailable, 60000);

  const acceptOrder = async (pedidoId: string) => {
    setAcceptingId(pedidoId);
    setError(null);
    try {
      await DeliveryRepository.tomarPedidoDisponible(pedidoId);
      await loadAvailable();
      router.push('/(app)/delivery/current-delivery' as any);
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
