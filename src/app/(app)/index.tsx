import { View } from 'react-native';
import tw from '@/lib/tailwind';
import { useAuthStore } from '@/features/auth/application/auth.store';
import DashboardClient from '@/features/dashboard/presentation/Dashboard';
import { DeliveryDashboardClient } from '@/features/delivery/presentation/profile/DeliveryDashboardClient';

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const isDomiciliario = user?.rol?.toLowerCase() === 'domiciliario';

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      {isDomiciliario ? <DeliveryDashboardClient /> : <DashboardClient />}
    </View>
  );
}
