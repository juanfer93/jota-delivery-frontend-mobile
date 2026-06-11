import { View } from 'react-native';
import tw from '@/lib/tailwind';
import { DeliveryClient } from '@/features/delivery/presentation/DeliveryClient';

export default function DeliveryPage() {
  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <DeliveryClient />
    </View>
  );
}
