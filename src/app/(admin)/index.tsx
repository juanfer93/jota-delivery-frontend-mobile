import { View } from 'react-native';
import tw from '@/lib/tailwind';
import DashboardClient from '@/features/dashboard/presentation/Dashboard';

export default function AdminDashboardPage() {
  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <DashboardClient />
    </View>
  );
}
