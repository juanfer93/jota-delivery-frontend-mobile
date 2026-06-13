import { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView } from "react-native";
import { useDeliveryStore } from "@/features/delivery/application/delivery.store";
import { useAuthStore } from '@/features/auth/application/auth.store';
import { useRouter } from "expo-router";
import tw from '@/lib/tailwind';
import { formatColombiaDateTime } from '@/core/time/colombia-time';
import { PedidoEstado } from '@/features/delivery/domain/delivery.types';

const STATUS_STYLES: Record<PedidoEstado, { badge: string; text: string }> = {
  [PedidoEstado.EN_PROCESO]: { badge: 'bg-jjBlue/15', text: 'text-jjBlue' },
  [PedidoEstado.HECHO]: { badge: 'bg-status-hecho/20', text: 'text-status-hecho' },
  [PedidoEstado.CANCELADO]: { badge: 'bg-status-cancelado/20', text: 'text-status-cancelado' },
};

export default function DeliveryHistoryClient() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isDomiciliario = user?.rol === 'DOMICILIARIO';
  const { pedidosHistorial, historyStatus, historyError, loadHistory, loadAllHistory } = useDeliveryStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isDomiciliario) {
      void loadHistory();
      return;
    }

    const timeout = setTimeout(() => void loadAllHistory(search), 300);
    return () => clearTimeout(timeout);
  }, [isDomiciliario, loadAllHistory, loadHistory, search]);

  const pedidosFiltrados = isDomiciliario
    ? pedidosHistorial.filter((p) => p.estado === 'HECHO' || p.estado === 'CANCELADO')
    : pedidosHistorial;

  return (
    <SafeAreaView style={tw`flex-1 bg-jj-beigeSoft`}>
      <ScrollView contentContainerStyle={tw`p-6 max-w-[800px] w-full self-center`}>

        <View style={tw`mb-8 flex-row items-center justify-between`}>
          <View>
            <Text style={tw`text-2xl font-bold text-jj-blueDark`}>Historial</Text>
            <Text style={tw`text-sm text-jj-blueDark/60`}>
              {isDomiciliario ? 'Pedidos finalizados' : 'Todos los pedidos registrados'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={tw`bg-jj-beige px-4 py-2 rounded-xl`}
          >
            <Text style={tw`text-jj-blueDark font-bold text-sm`}>Volver</Text>
          </TouchableOpacity>
        </View>

        {!isDomiciliario ? (
          <TextInput
            testID="search-historial-pedidos"
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por comercio o domiciliario"
            placeholderTextColor="#718096"
            style={tw`mb-5 rounded-2xl border border-jj-beige bg-white px-4 py-3 text-sm text-jj-blueDark`}
          />
        ) : null}

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
                    style={tw`${STATUS_STYLES[p.estado].badge} px-3 py-1 rounded-full`}
                  >
                    <Text style={tw`${STATUS_STYLES[p.estado].text} text-xs font-bold`}>
                      {p.estado}
                    </Text>
                  </View>
                </View>

                <Text style={tw`text-sm text-jj-blueDark/80`}>Dirección: {p.direccionDestino}</Text>
                <Text style={tw`mt-2 text-sm text-jj-blueDark/80`}>
                  Comercio: {p.comercio?.nombre ?? 'Sin comercio'}
                </Text>
                <Text style={tw`mt-1 text-sm text-jj-blueDark/80`}>
                  Domiciliario: {p.usuario?.nombre ?? 'Sin domiciliario'}
                </Text>

                <Text style={tw`text-sm font-bold mt-2 text-jj-blueDark`}>Valor: {Number(p.valorFinal ?? 0).toLocaleString()}</Text>
                <Text style={tw`mt-2 text-xs text-jj-blueDark/60`}>
                  Creado: {formatColombiaDateTime(p.createdAt)}
                </Text>
              </View>
            ))}
          </View>
        )}
        {historyError ? <Text style={tw`mt-4 text-sm text-red-700`}>{historyError}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
