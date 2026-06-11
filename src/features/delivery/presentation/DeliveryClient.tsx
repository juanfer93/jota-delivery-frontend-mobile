import { useEffect, useMemo } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { useDeliveryStore } from '@/features/delivery/application/delivery.store';
import { PedidoEstado } from '@/features/delivery/domain/delivery.types';

const EstadoOpciones = [
  { label: 'En proceso', value: PedidoEstado.EN_PROCESO },
  { label: 'Hecho', value: PedidoEstado.HECHO },
  { label: 'Cancelado', value: PedidoEstado.CANCELADO },
];

export function DeliveryClient() {
  const router = useRouter();
  const { pedidosHoy, status, error, loadData, updateEstado } = useDeliveryStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

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

      <View style={tw`mb-5`}>
        <TouchableOpacity
          onPress={() => router.push('/delivery/history')}
          style={tw`w-full rounded-3xl border border-jjBlueDark bg-white px-4 py-3`}
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
              <View key={pedido.id} style={tw`mb-4 rounded-3xl border border-jjBeige bg-jjBeigeSoft p-4`}>
                <Text style={tw`text-sm font-bold text-jjBlueDark`}>{pedido.comercio?.nombre ?? `Comercio ${pedido.comercioId}`}</Text>
                <Text style={tw`mt-2 text-sm text-jjBlueDark/70`}>Entrega: {pedido.direccionDestino}</Text>
                <Text style={tw`mt-1 text-sm text-jjBlueDark/70`}>Valor: ${Number(pedido.valorFinal).toLocaleString()}</Text>
                <Text style={tw`mt-1 text-sm text-jjBlueDark/70`}>Estado actual: {pedido.estado}</Text>

                <View style={tw`mt-4 flex-row flex-wrap gap-2`}>
                  {EstadoOpciones.map((option) => {
                    const active = option.value === pedido.estado;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => handleChangeEstado(pedido.id.toString(), option.value)}
                        disabled={active}
                        style={tw`rounded-full px-3 py-2 ${active ? 'bg-jjBlueDark/20' : 'bg-jjBlueDark'}`}
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
