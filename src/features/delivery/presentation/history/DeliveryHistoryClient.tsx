import { useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView } from "react-native";
import { useDeliveryStore } from "@/features/delivery/application/delivery.store";
import { useRouter } from "expo-router";
import tw from '@/lib/tailwind';
import { formatColombiaDateTime } from '@/core/time/colombia-time';

export default function DeliveryHistoryClient() {
  const router = useRouter();
  const { pedidosHistorial, historyStatus, loadHistory } = useDeliveryStore();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const pedidosFiltrados = pedidosHistorial.filter(
    (p) => p.estado === 'HECHO' || p.estado === 'CANCELADO'
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-jj-beigeSoft`}>
      <ScrollView contentContainerStyle={tw`p-6 max-w-[800px] w-full self-center`}>

        <View style={tw`mb-8 flex-row items-center justify-between`}>
          <View>
            <Text style={tw`text-2xl font-bold text-jj-blueDark`}>Historial</Text>
            <Text style={tw`text-sm text-jj-blueDark/60`}>Pedidos finalizados</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.replace('/')}
            style={tw`bg-jj-beige px-4 py-2 rounded-xl`}
          >
            <Text style={tw`text-jj-blueDark font-bold text-sm`}>Volver</Text>
          </TouchableOpacity>
        </View>

        {historyStatus === 'loading' ? (
          <ActivityIndicator size="large" color={tw.color('jj-blue')} />
        ) : pedidosFiltrados.length === 0 ? (
          <View style={tw`p-8 items-center bg-white rounded-3xl border border-dashed border-jj-beige`}>
            <Text style={tw`text-jj-blueDark/50`}>No hay registros en el historial.</Text>
          </View>
        ) : (
          <View style={tw`gap-4`}>
            {pedidosFiltrados.map((p) => (
              <View key={p.id} style={tw`bg-white p-5 rounded-3xl border border-jj-blueDark/5 shadow-sm`}>
                <View style={tw`flex-row justify-between items-center mb-3`}>
                  <Text style={tw`font-bold text-jj-blue`}>ID: {p.id.toString().slice(-6)}</Text>

                  <View
                    style={tw`${p.estado === 'HECHO' ? 'bg-status-hecho/20' : 'bg-status-cancelado/20'} px-3 py-1 rounded-full`}
                  >
                    <Text style={tw`${p.estado === 'HECHO' ? 'text-status-hecho' : 'text-status-cancelado'} text-xs font-bold`}>
                      {p.estado}
                    </Text>
                  </View>
                </View>

                <Text style={tw`text-sm text-jj-blueDark/80`}>Dirección: {p.direccionDestino}</Text>

                <Text style={tw`text-sm font-bold mt-2 text-jj-blueDark`}>Valor: {Number(p.valorFinal ?? 0).toLocaleString()}</Text>
                <Text style={tw`mt-2 text-xs text-jj-blueDark/60`}>
                  Creado: {formatColombiaDateTime(p.createdAt)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
