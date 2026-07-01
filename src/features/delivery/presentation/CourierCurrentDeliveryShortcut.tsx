import { Text, TouchableOpacity, View } from 'react-native';
import tw from '@/lib/tailwind';
import { PedidoEstado, CurrentDeliveryItem } from '@/features/delivery/domain/delivery.types';
import { formatMoney, formatRouteSummary, getCourierEarnings } from './delivery.utils';

interface CourierCurrentDeliveryShortcutProps {
  currentDelivery: CurrentDeliveryItem | null;
  currentDeliveries?: CurrentDeliveryItem[];
  onPress: () => void;
}

export function CourierCurrentDeliveryShortcut({
  currentDelivery,
  currentDeliveries = currentDelivery ? [currentDelivery] : [],
  onPress,
}: CourierCurrentDeliveryShortcutProps) {
  const activeDeliveries = currentDeliveries.filter(
    (delivery) => delivery.estado === PedidoEstado.EN_PROCESO,
  );
  const primaryDelivery = activeDeliveries[0] ?? null;

  if (!primaryDelivery) {
    return null;
  }

  return (
    <View style={tw`mb-5 overflow-hidden rounded-3xl border border-jjBlueDark/10 bg-white shadow-sm`}>
      <View style={tw`bg-jjBlueDark px-5 py-4`}>
        <Text style={tw`text-xs font-bold uppercase tracking-[2px] text-jjBeige/80`}>Servicio activo</Text>
        <Text style={tw`mt-1 text-xl font-bold text-jjBeige`}>
          {activeDeliveries.length > 1 ? `${activeDeliveries.length} pedidos en proceso` : 'Pedido en proceso'}
        </Text>
        <Text style={tw`mt-2 text-sm font-semibold leading-5 text-jjBeige`}>
          {formatRouteSummary(primaryDelivery)}
        </Text>
      </View>

      <View style={tw`px-5 pt-4`}>
        <View style={tw`rounded-3xl bg-jjBeigeSoft p-4`}>
          <Text style={tw`mb-3 text-xs font-bold uppercase tracking-[1.5px] text-jjBlueDark/50`}>
            Detalles del servicio
          </Text>
          <Text style={tw`mt-2 text-sm text-jjBlueDark`}>
            <Text style={tw`font-bold`}>Comercio: </Text>{primaryDelivery.comercio?.nombre ?? 'Comercio'}
          </Text>
          <Text style={tw`mt-2 text-sm text-jjBlueDark`}>
            <Text style={tw`font-bold`}>Ganancia: </Text>${formatMoney(getCourierEarnings(primaryDelivery))}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        testID="view-current-delivery"
        onPress={onPress}
        style={tw`mx-5 my-4 rounded-2xl bg-jjBlueDark px-4 py-3`}
      >
        <Text style={tw`text-center font-bold text-white`}>Ver pedidos en proceso</Text>
      </TouchableOpacity>
    </View>
  );
}
