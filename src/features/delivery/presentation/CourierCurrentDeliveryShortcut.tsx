import { Text, TouchableOpacity, View } from 'react-native';
import tw from '@/lib/tailwind';
import { PedidoEstado, CurrentDeliveryItem } from '@/features/delivery/domain/delivery.types';
import { formatMoney, formatRouteSummary } from './delivery.utils';

interface CourierCurrentDeliveryShortcutProps {
  currentDelivery: CurrentDeliveryItem | null;
  onPress: () => void;
}

export function CourierCurrentDeliveryShortcut({
  currentDelivery,
  onPress,
}: CourierCurrentDeliveryShortcutProps) {
  if (!currentDelivery || currentDelivery.estado !== PedidoEstado.EN_PROCESO) {
    return null;
  }

  return (
    <View style={tw`mb-5 overflow-hidden rounded-3xl border border-jjBlueDark/10 bg-white shadow-sm`}>
      <View style={tw`bg-jjBlueDark px-5 py-4`}>
        <Text style={tw`text-xs font-bold uppercase tracking-[2px] text-jjBeige/80`}>Servicio activo</Text>
        <Text style={tw`mt-1 text-xl font-bold text-jjBeige`}>Pedido en proceso</Text>
        <Text style={tw`mt-2 text-sm font-semibold leading-5 text-jjBeige`}>
          {formatRouteSummary(currentDelivery)}
        </Text>
      </View>

      <View style={tw`px-5 pt-4`}>
        <View style={tw`rounded-3xl bg-jjBeigeSoft p-4`}>
          <Text style={tw`mb-3 text-xs font-bold uppercase tracking-[1.5px] text-jjBlueDark/50`}>
            Detalles del servicio
          </Text>
          <Text style={tw`mt-2 text-sm text-jjBlueDark`}>
            <Text style={tw`font-bold`}>Comercio: </Text>{currentDelivery.comercio?.nombre ?? 'Comercio'}
          </Text>
          <Text style={tw`mt-2 text-sm text-jjBlueDark`}>
            <Text style={tw`font-bold`}>Valor: </Text>${formatMoney(currentDelivery.valorFinal)}
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
