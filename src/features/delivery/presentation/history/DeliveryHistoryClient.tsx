import { useEffect, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView } from "react-native";
import { useDeliveryStore } from "@/features/delivery/application/delivery.store";
import { PedidoEstado } from "@/features/delivery/domain/delivery.types";
import { useRouter } from "expo-router";
import tw from '@/lib/tailwind';

export default function DeliveryHistoryClient() {
  const router = useRouter();
  const { pedidosHoy, status, loadData } = useDeliveryStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pedidosHistorial = useMemo(() => {
    return pedidosHoy.filter(p =>
      p.estado === PedidoEstado.ENTREGADO || p.estado === PedidoEstado.CANCELADO
    );
  }, [pedidosHoy]);

  return (
    <SafeAreaView style={tw`flex-1 bg-jj-beigeSoft`}>
      <ScrollView contentContainerStyle={tw`p-6 max-w-[800px] w-full self-center`}>

        {/* Header */}
        <View style={tw`mb-8 flex-row items-center justify-between`}>
          <View>
            <Text style={tw`text-2xl font-bold text-jj-blueDark`}>Historial</Text>
            <Text style={tw`text-sm text-jj-blueDark/60`}>Pedidos finalizados</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={tw`bg-jj-beige px-4 py-2 rounded-xl`}
          >
            <Text style={tw`text-jj-blueDark font-bold text-sm`}>Volver</Text>
          </TouchableOpacity>
        </View>

        {status === 'loading' ? (
          <ActivityIndicator size="large" color={tw.color('jj-blue')} />
        ) : pedidosHistorial.length === 0 ? (
          <View style={tw`p-8 items-center bg-white rounded-3xl border border-dashed border-jj-beige`}>
            <Text style={tw`text-jj-blueDark/50`}>No hay registros en el historial.</Text>
          </View>
        ) : (
          <View style={tw`gap-4`}>
            {pedidosHistorial.map((p) => (
              <View key={p.id} style={tw`bg-white p-5 rounded-3xl border border-jj-blueDark/5 shadow-sm`}>
                <View style={tw`flex-row justify-between items-center mb-3`}>
                  <Text style={tw`font-bold text-jj-blue`}>ID: {p.id.slice(-6)}</Text>

                  <View style={tw`px-3 py-1 rounded-full ${p.estado === PedidoEstado.ENTREGADO ? "bg-status-hecho/20" : "bg-status-cancelado/20"
                    }`}>
                    <Text style={tw`text-xs font-bold ${p.estado === PedidoEstado.ENTREGADO ? "text-status-hecho" : "text-status-cancelado"
                      }`}>
                      {p.estado}
                    </Text>
                  </View>
                </View>

                <Text style={tw`text-sm text-jj-blueDark/80`}>Dirección: {p.direccionDestino}</Text>
                <Text style={tw`text-sm font-bold mt-2 text-jj-blueDark`}>
                  Valor: {Number(p.valorFinal ?? 0).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}