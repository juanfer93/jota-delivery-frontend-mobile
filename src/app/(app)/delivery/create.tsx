import React from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import tw from '@/lib/tailwind';
import CreatePedido from '@/features/delivery/presentation/CreatePedido';
import { useAuthStore } from '@/features/auth/application/auth.store';

export default function CreatePedidoPage() {
  const user = useAuthStore((state) => state.user);

  if (user?.rol !== 'admin') {
    return <Redirect href="/delivery" />;
  }

  return (
    <View style={tw`flex-1 bg-white`}>
      <CreatePedido />
    </View>
  );
}
