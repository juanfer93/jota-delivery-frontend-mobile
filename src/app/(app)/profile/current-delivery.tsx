import React from 'react';
import { View } from 'react-native';
import tw from '@/lib/tailwind';
import { CurrentDelivery } from '@/features/delivery/presentation/profile/CurrentDelivery';

export default function CurrentDeliveryPage() {
  return (
    <View style={tw`flex-1 bg-white`}>
      <CurrentDelivery />
    </View>
  );
}