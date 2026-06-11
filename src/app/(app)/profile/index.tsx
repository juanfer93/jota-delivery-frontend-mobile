import { View } from 'react-native';
import tw from '@/lib/tailwind';
import AdminProfileClient from '@/features/admin/presentation/AdminProfileClient';
import { useAuthStore } from '@/features/auth/application/auth.store';
import { ProfileDeliveryClient } from '@/features/delivery/presentation/profile/ProfileDeliveryClient';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const isDomiciliario = user?.rol?.toLowerCase() === 'domiciliario';

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      {isDomiciliario ? <ProfileDeliveryClient /> : <AdminProfileClient />}
    </View>
  );
}
