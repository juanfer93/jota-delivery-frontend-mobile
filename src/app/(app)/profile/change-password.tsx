import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';

export default function ChangePasswordPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={tw`flex-1 bg-[#FFF9E8]`}>
      <View style={tw`bg-[#174A8B] pt-4 pb-3 px-4 flex-row justify-between items-center`}>
        <Text style={tw`font-semibold text-sm text-[#FFF9E8]`}>Cambiar Contraseña</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={tw`text-sm text-[#FFF9E8] underline`}>Cerrar</Text>
        </TouchableOpacity>
      </View>
      
      <View style={tw`flex-1 items-center justify-center p-6`}>
        <Text style={tw`text-4xl mb-4`}>🔒</Text>
        <Text style={tw`text-xl font-bold text-[#030303] text-center mb-2`}>
          Cambio de Contraseña
        </Text>
        <Text style={tw`text-[#030303]/70 text-center`}>
          Esta función está en desarrollo. Pronto podrás actualizar tu contraseña desde aquí.
        </Text>
      </View>
    </SafeAreaView>
  );
}
