import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import tw from '@/lib/tailwind';

export function ProfileDeliveryClient() {
  return (
    <SafeAreaView style={tw`flex-1 bg-jj-beigeSoft`}>
      <ScrollView contentContainerStyle={tw`p-6 max-w-[800px] w-full self-center`}>
        <View style={tw`mb-8`}>
          <Text style={tw`text-2xl font-bold text-jj-blueDark`}>Hola, Repartidor</Text>
          <Text style={tw`text-sm text-jj-blueDark/60`}>Gestiona tus pedidos del día</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/profile/current-delivery')}
          style={tw`bg-jj-blueDark p-6 rounded-3xl shadow-lg mb-6`}
        >
          <Text style={tw`text-jj-beige text-xs uppercase tracking-widest font-bold mb-1`}>
            Estado actual
          </Text>
          <Text style={tw`text-xl text-white font-semibold`}>Ver pedido en curso</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`bg-white p-5 rounded-2xl border border-jj-blueDark/10 flex-row justify-between items-center`}
          onPress={() => router.push('/delivery/history')}
        >
          <Text style={tw`font-bold text-jj-blueDark`}>Historial de pedidos</Text>
          <Text style={tw`text-jj-blue font-bold`}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
