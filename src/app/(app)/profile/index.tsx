import { View } from 'react-native';
import tw from '@/lib/tailwind';
import AdminProfileClient from '@/features/admin/presentation/AdminProfileClient';

export default function ProfilePage() {
  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <AdminProfileClient />
    </View>
  );
}
