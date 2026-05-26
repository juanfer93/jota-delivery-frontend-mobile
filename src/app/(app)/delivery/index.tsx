import { View } from 'react-native';
import tw from '@/lib/tailwind';
import { DeliveryClient } from '@/features/delivery/presentation/DeliveryClient';
import { useAuthStore } from '@/features/auth/application/auth.store'; 

export default function DeliveryPage() {
  const user = useAuthStore((state) => state.user);

  const adminName = user?.nombre || 'Invitado';
  
  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <DeliveryClient adminName={adminName} />
    </View>
  );
}