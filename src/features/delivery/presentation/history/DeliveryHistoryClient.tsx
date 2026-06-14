import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useDeliveryStore } from '@/features/delivery/application/delivery.store';
import { useAuthStore } from '@/features/auth/application/auth.store';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import DeliveryHistoryFilters from './DeliveryHistoryFilters';
import DeliveryHistoryCard from './DeliveryHistoryCard';
import {
  DeliveryHistoryFilterPatch,
  DeliveryHistoryFilterState,
} from '@/features/delivery/domain/delivery-history.types';
import {
  INITIAL_DELIVERY_HISTORY_FILTERS,
  filterDeliveryHistory,
  getBaseHistoryPedidos,
  getTimeFilterError,
} from './delivery-history.filters';

export default function DeliveryHistoryClient() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isDomiciliario = user?.rol?.toLowerCase() === 'domiciliario';

  const {
    pedidosHistorial,
    historyStatus,
    historyError,
    loadHistory,
    loadAllHistory,
  } = useDeliveryStore();

  const [filters, setFilters] = useState<DeliveryHistoryFilterState>(
    INITIAL_DELIVERY_HISTORY_FILTERS,
  );

  useEffect(() => {
    if (isDomiciliario) {
      void loadHistory();
      return;
    }

    const timeout = setTimeout(() => {
      void loadAllHistory(filters.domiciliario.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [
    filters.domiciliario,
    isDomiciliario,
    loadAllHistory,
    loadHistory,
  ]);

  const basePedidos = useMemo(
    () => getBaseHistoryPedidos(pedidosHistorial, isDomiciliario),
    [isDomiciliario, pedidosHistorial],
  );

  const timeFilterError = useMemo(
    () => getTimeFilterError(filters.startTime, filters.endTime),
    [filters.startTime, filters.endTime],
  );

  const pedidosFiltrados = useMemo(
    () =>
      filterDeliveryHistory({
        pedidos: basePedidos,
        filters,
        isDomiciliario,
        timeFilterError,
      }),
    [
      basePedidos,
      filters,
      isDomiciliario,
      timeFilterError,
    ],
  );

  const handleChangeFilters = (updatedFilters: DeliveryHistoryFilterPatch) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      ...updatedFilters,
    }));
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_DELIVERY_HISTORY_FILTERS);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-jj-beigeSoft`}>
      <ScrollView contentContainerStyle={tw`p-6 max-w-[900px] w-full self-center`}>
        <View style={tw`mb-8 flex-row items-center justify-between`}>
          <View style={tw`flex-1 pr-4`}>
            <Text style={tw`text-2xl font-bold text-jj-blueDark`}>
              Historial
            </Text>
            <Text style={tw`text-sm text-jj-blueDark/60`}>
              {isDomiciliario ? 'Pedidos finalizados' : 'Todos los pedidos registrados'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            style={tw`bg-jj-beige px-4 py-2 rounded-xl`}
          >
            <Text style={tw`text-jj-blueDark font-bold text-sm`}>
              Volver
            </Text>
          </TouchableOpacity>
        </View>

        <DeliveryHistoryFilters
          isDomiciliario={isDomiciliario}
          filters={filters}
          resultCount={pedidosFiltrados.length}
          totalCount={basePedidos.length}
          timeFilterError={timeFilterError}
          onChangeFilters={handleChangeFilters}
          onClearFilters={handleClearFilters}
        />

        {historyStatus === 'loading' ? (
          <View style={tw`py-12 items-center`}>
            <ActivityIndicator size="large" color={tw.color('jj-blue')} />
            <Text style={tw`mt-3 text-sm text-jj-blueDark/60`}>
              Cargando historial...
            </Text>
          </View>
        ) : pedidosFiltrados.length === 0 ? (
          <View style={tw`p-8 items-center bg-white rounded-3xl border border-dashed border-jj-beige`}>
            <Text style={tw`text-jj-blueDark/50 text-center`}>
              No hay registros que coincidan con los filtros.
            </Text>
          </View>
        ) : (
          <View style={tw`gap-4`}>
            {pedidosFiltrados.map((pedido) => (
              <DeliveryHistoryCard
                key={pedido.id}
                pedido={pedido}
                isDomiciliario={isDomiciliario}
              />
            ))}
          </View>
        )}

        {historyError ? (
          <View style={tw`mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3`}>
            <Text style={tw`text-sm text-red-700`}>
              {historyError}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}