import { View } from 'react-native';
import tw from '@/lib/tailwind';
import DeliveryHistoryClient from '@/features/delivery/presentation/history/DeliveryHistoryClient';

export default function DeliveryHistoryPage() {
  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <DeliveryHistoryClient />
    </View>
  );
}