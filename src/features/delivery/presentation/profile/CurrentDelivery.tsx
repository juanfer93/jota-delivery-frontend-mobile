import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import tw from '@/lib/tailwind';
import { useDeliveryStore } from "@/features/delivery/application/delivery.store";
import { PedidoEstado } from "@/features/delivery/domain/delivery.types";

export function CurrentDelivery() {
  const { pedidosHoy, updateEstado } = useDeliveryStore();

  const activePedido = pedidosHoy.find(p =>
    p.estado === PedidoEstado.EN_CAMINO || p.estado === PedidoEstado.ASIGNADO
  );

  if (!activePedido) {
    return (
      <SafeAreaView style={tw`flex-1 bg-jj-beigeSoft items-center justify-center p-6`}>
        <Text style={tw`text-jj-blueDark font-bold`}>No tienes pedidos activos actualmente.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-jj-beigeSoft`}>
      <ScrollView contentContainerStyle={tw`p-6 max-w-[800px] w-full self-center`}>

        <View style={tw`bg-white p-6 rounded-3xl shadow-sm border border-jj-blueDark/5`}>
          <Text style={tw`text-xs font-bold text-jj-blue uppercase mb-1`}>Pedido Activo</Text>
          <Text style={tw`text-2xl font-bold text-jj-blueDark mb-6`}>{activePedido.direccionEntrega}</Text>

          <View style={tw`border-t border-jj-beige py-4 mb-4`}>
            <Text style={tw`text-sm text-jj-blueDark/60`}>Valor a cobrar:</Text>
            <Text style={tw`text-lg font-bold text-jj-blueDark`}>{Number(activePedido.valorPedido).toLocaleString()}</Text>
          </View>

          <TouchableOpacity
            onPress={() => updateEstado(activePedido.id.toString(), PedidoEstado.ENTREGADO)}
            style={tw`bg-jj-blue p-4 rounded-2xl items-center`}
          >
            <Text style={tw`text-white font-bold`}>Marcar como Entregado</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}