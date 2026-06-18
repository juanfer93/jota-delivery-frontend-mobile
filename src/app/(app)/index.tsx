import { View } from 'react-native';
import { Redirect } from 'expo-router';
import tw from '@/lib/tailwind';
import { useAuthStore } from '@/features/auth/application/auth.store';
import DashboardClient from '@/features/dashboard/presentation/Dashboard';
import { isDomiciliarioRole } from '@/features/auth/domain/auth.types';

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const isDomiciliario = isDomiciliarioRole(user?.rol);

  if (isDomiciliario) {
    return <Redirect href="/delivery" />;
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <DashboardClient />
    </View>
  );
}
