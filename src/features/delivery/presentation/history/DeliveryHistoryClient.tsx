import { useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView } from "react-native";
import { useDeliveryStore } from "@/features/delivery/application/delivery.store";
import { useRouter } from "expo-router";
import tw from '@/lib/tailwind';

export default function DeliveryHistoryClient() {
  const router = useRouter();
  const { pedidosHistorial, historyStatus, loadHistory } = useDeliveryStore();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <SafeAreaView style={tw`flex-1 bg-jjBeigeSoft`}>
      <ScrollView contentContainerStyle={tw`p-6 max-w-[800px] w-full self-center`}>

        <View style={tw`mb-8 flex-row items-center justify-between`}>
          <View>
            <Text style={tw`text-2xl font-bold text-jjBlueDark`}>Historial</Text>
            <Text style={tw`text-sm text-jjBlueDark/60`}>Pedidos finalizados</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.replace('/')}
            style={tw`bg-jjBeige px-4 py-2 rounded-xl`}
          >
            <Text style={tw`text-jjBlueDark font-bold text-sm`}>Volver</Text>
          </TouchableOpacity>
        </View>

        {historyStatus === 'loading' ? (
          <ActivityIndicator size="large" color={tw.color('jj-blue')} />
        ) : pedidosHistorial.length === 0 ? (
          <View style={tw`p-8 items-center bg-white rounded-3xl border border-dashed border-jjBeige`}>
            <Text style={tw`text-jjBlueDark/50`}>No hay registros en el historial.</Text>
          </View>
        ) : (
          <View style={tw`gap-4`}>
            {pedidosHistorial.map((p) => (
              <View key={p.id} style={tw`bg-white p-5 rounded-3xl border border-jjBlueDark/5 shadow-sm`}>
                <View style={tw`flex-row justify-between items-center mb-3`}>
                  <Text style={tw`font-bold text-jjBlue`}>ID: {p.id.toString().slice(-6)}</Text>

                  <View
                    style={tw`${p.estado === 'HECHO' ? 'bg-status-hecho/20' : 'bg-status-cancelado/20'} px-3 py-1 rounded-full`}
                  >
                    <Text style={tw`${p.estado === 'HECHO' ? 'text-status-hecho' : 'text-status-cancelado'} text-xs font-bold`}>
                      {p.estado}
                    </Text>
                  </View>
                </View>

                <Text style={tw`text-sm text-jjBlueDark/80`}>Dirección: {p.direccionDestino}</Text>

                <Text style={tw`text-sm font-bold mt-2 text-jjBlueDark`}>Valor: {Number(p.valorFinal ?? 0).toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
