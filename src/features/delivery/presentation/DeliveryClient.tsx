import { useEffect, useMemo } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { useDeliveryStore } from '@/features/delivery/application/delivery.store';
import { PedidoEstado } from '@/features/delivery/domain/delivery.types';
import { formatColombiaDateTime } from '@/core/time/colombia-time';

const EstadoOpciones = [
  { label: 'En proceso', value: PedidoEstado.EN_PROCESO },
  { label: 'Hecho', value: PedidoEstado.HECHO },
  { label: 'Cancelado', value: PedidoEstado.CANCELADO },
];

export function DeliveryClient() {
  const router = useRouter();
  const { pedidoId } = useLocalSearchParams<{ pedidoId?: string }>();
  const { pedidosHoy, status, error, refreshPedidosHoy, updateEstado } = useDeliveryStore();

  useEffect(() => {
    void refreshPedidosHoy();
    const interval = setInterval(() => void refreshPedidosHoy(), 15000);
    return () => clearInterval(interval);
  }, [refreshPedidosHoy]);

  const pedidosPorDomiciliario = useMemo(() => {
    const map = new Map<string, typeof pedidosHoy>();
    pedidosHoy.forEach((pedido) => {
      const key = pedido.usuario?.nombre ?? 'Sin domiciliario';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(pedido);
    });
    return Array.from(map.entries());
  }, [pedidosHoy]);

  const handleChangeEstado = async (pedidoId: string, nuevoEstado: PedidoEstado) => {
    await updateEstado(pedidoId, nuevoEstado);
  };

  return (
    <ScrollView style={tw`flex-1 bg-jjBeigeSoft`} contentContainerStyle={tw`p-6`}>
      <View style={tw`mb-6`}>
        <Text style={tw`text-3xl font-bold text-jjBlueDark`}>Pedidos</Text>
        <Text style={tw`text-sm text-jjBlueDark/60 mt-2`}>Administra las órdenes y asignaciones por domiciliario.</Text>
      </View>

      <View style={tw`mb-5 flex-row gap-3`}>
        <TouchableOpacity
          testID="btn-crear-pedido"
          onPress={() => router.push('/delivery/create')}
          style={tw`flex-1 rounded-3xl bg-jjBlueDark px-4 py-3`}
        >
          <Text style={tw`text-center text-sm font-bold text-white`}>Crear pedido</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="btn-historial-pedidos"
          onPress={() => router.push('/delivery/history')}
          style={tw`flex-1 rounded-3xl border border-jjBlueDark bg-white px-4 py-3`}
        >
          <Text style={tw`text-center text-sm font-bold text-jjBlueDark`}>Historial</Text>
        </TouchableOpacity>
      </View>

      {status === 'loading' ? (
        <View style={tw`items-center justify-center py-16`}>
          <ActivityIndicator size="large" color={tw.color('jj-blue')} />
          <Text style={tw`mt-3 text-jjBlueDark/70`}>Cargando pedidos...</Text>
        </View>
      ) : pedidosHoy.length === 0 ? (
        <View style={tw`items-center justify-center py-16`}>
          <Text style={tw`text-jjBlueDark/70`}>No hay pedidos para hoy.</Text>
        </View>
      ) : (
        pedidosPorDomiciliario.map(([domiciliario, items]) => (
          <View key={domiciliario} style={tw`mb-4 rounded-3xl border border-jjBeige bg-white p-4 shadow-sm`}>
            <View style={tw`mb-4 flex-row items-center justify-between`}>
              <Text style={tw`text-base font-bold text-jjBlueDark`}>{domiciliario}</Text>
              <Text style={tw`text-xs text-jjBlueDark/60`}>{items.length} pedido(s)</Text>
            </View>

            {items.map((pedido) => (
              <View
                key={pedido.id}
                style={tw`mb-4 rounded-3xl border ${pedidoId === pedido.id ? 'border-jjBlueDark' : 'border-jjBeige'} bg-jjBeigeSoft p-4`}
              >
                <Text style={tw`text-sm font-bold text-jjBlueDark`}>{pedido.comercio?.nombre ?? `Comercio ${pedido.comercioId}`}</Text>
                <Text style={tw`mt-2 text-sm text-jjBlueDark/70`}>Entrega: {pedido.direccionDestino}</Text>
                <Text style={tw`mt-1 text-sm text-jjBlueDark/70`}>Valor: ${Number(pedido.valorFinal).toLocaleString()}</Text>
                <Text style={tw`mt-1 text-sm text-jjBlueDark/70`}>Estado actual: {pedido.estado}</Text>
                <Text style={tw`mt-1 text-sm text-jjBlueDark/70`}>
                  Creado: {formatColombiaDateTime(pedido.createdAt)}
                </Text>
                {pedido.assignedAt ? (
                  <Text style={tw`mt-1 text-sm text-jjBlueDark/70`}>
                    Asignado: {formatColombiaDateTime(pedido.assignedAt)}
                  </Text>
                ) : null}

                <View style={tw`mt-4 flex-row flex-wrap gap-2`}>
                  {EstadoOpciones.map((option) => {
                    const active = option.value === pedido.estado;
                    const finalizado = pedido.estado === PedidoEstado.HECHO
                      || pedido.estado === PedidoEstado.CANCELADO;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        testID={`pedido-${pedido.id}-estado-${option.value}`}
                        onPress={() => handleChangeEstado(pedido.id.toString(), option.value)}
                        disabled={finalizado || active}
                        style={tw`rounded-full px-3 py-2 ${finalizado || active ? 'bg-jjBlueDark/20' : 'bg-jjBlueDark'}`}
                      >
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

      {error && (
        <View style={tw`mt-4 rounded-3xl bg-red-100 border border-red-300 p-4`}>
          <Text style={tw`text-sm text-red-700`}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
}
