import { View } from 'react-native';
import tw from '@/lib/tailwind';
import { ProfileDeliveryClient } from '@/features/delivery/presentation/profile/ProfileDeliveryClient';

export default function ProfileDeliveryPage() {
  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <ProfileDeliveryClient />
    </View>
  );
}