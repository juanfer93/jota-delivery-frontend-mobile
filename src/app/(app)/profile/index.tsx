import { View } from 'react-native';
import tw from '@/lib/tailwind';
import { ProfileAdminClient } from '@/features/delivery/presentation/profile/ProfileDeliveryClient';

export default function ProfileAdminPage() {
  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <ProfileAdminClient />
    </View>
  );
}