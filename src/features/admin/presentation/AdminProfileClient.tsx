import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import tw from '@/lib/tailwind';
import { useAuthStore } from '@/features/auth/application/auth.store';

export default function AdminProfileClient() {
  const { user } = useAuthStore();

  const name = (user as any)?.nombre || (user as any)?.name || (user as any)?.email || 'Administrador';

  return (
    <SafeAreaView style={tw`flex-1 bg-jj-beigeSoft`}>
      <ScrollView contentContainerStyle={tw`p-6 max-w-[800px] w-full self-center`}>
        <View style={tw`mb-8`}>
          <Text style={tw`text-2xl font-bold text-jj-blueDark`}>Hola, {name}</Text>
          <Text style={tw`text-sm text-jj-blueDark/60`}>Panel de administración</Text>
        </View>

        <View style={tw`bg-white p-5 rounded-2xl border border-jj-blueDark/10`}> 
          <Text style={tw`font-bold text-jj-blueDark mb-2`}>Información de cuenta</Text>
          <Text style={tw`text-jj-blueDark/80`}>Email: {(user as any)?.email || '—'}</Text>
          <Text style={tw`text-jj-blueDark/80`}>Rol: {(user as any)?.rol || '—'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
