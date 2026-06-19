import { Text, TouchableOpacity, View } from 'react-native';
import tw from '@/lib/tailwind';
import { PedidoEstado, CurrentDeliveryItem } from '@/features/delivery/domain/delivery.types';
import { formatMoney } from './delivery.utils';

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
    <View style={tw`mb-5 rounded-3xl border border-jjBlueDark/10 bg-white p-5`}>
      <Text style={tw`text-xl font-bold text-jjBlueDark`}>Pedido en proceso</Text>
      <Text style={tw`mt-2 text-sm text-jjBlueDark/70`}>
        {currentDelivery.comercio?.nombre ?? 'Comercio'} - {currentDelivery.direccionDestino}
      </Text>
      <Text style={tw`mt-1 text-sm text-jjBlueDark/60`}>
        Valor: ${formatMoney(currentDelivery.valorFinal)}
      </Text>
      <TouchableOpacity
        testID="view-current-delivery"
        onPress={onPress}
        style={tw`mt-4 rounded-2xl bg-jjBlueDark px-4 py-3`}
      >
        <Text style={tw`text-center font-bold text-white`}>Ver pedidos en proceso</Text>
      </TouchableOpacity>
    </View>
  );
}
