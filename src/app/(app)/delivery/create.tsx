import React from 'react';
import { View } from 'react-native';
import tw from '@/lib/tailwind';
import CreatePedido from '@/features/delivery/presentation/CreatePedido';

export default function CreatePedidoPage() {
  return (
    <View style={tw`flex-1 bg-white`}>
      <CreatePedido />
    </View>
  );
}