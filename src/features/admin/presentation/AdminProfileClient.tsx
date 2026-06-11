import { useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import tw from '@/lib/tailwind';
import { useAuthStore } from '@/features/auth/application/auth.store';

export default function AdminProfileClient() {
  const { user, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const name = user?.nombre || user?.email || 'Administrador';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace('/login');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : error;
      console.error('[PROFILE] Error durante logout:', message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-jj-beigeSoft`}>
      <ScrollView contentContainerStyle={tw`p-6 max-w-[800px] w-full self-center`}>
        <View style={tw`mb-8`}>
          <Text style={tw`text-2xl font-bold text-jj-blueDark`}>Hola, {name}</Text>
          <Text style={tw`text-sm text-jj-blueDark/60`}>Panel de administración</Text>
        </View>

        <View style={tw`mb-6 rounded-3xl border border-jj-blueDark/10 bg-white p-5`}>
          <Text style={tw`mb-3 font-bold text-jj-blueDark`}>Información de cuenta</Text>
          <Text style={tw`mb-1 text-jj-blueDark/80`}>Nombre: {name}</Text>
          <Text style={tw`mb-1 text-jj-blueDark/80`}>Email: {user?.email || '-'}</Text>
          <Text style={tw`text-jj-blueDark/80`}>Rol: {user?.rol || '-'}</Text>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          disabled={isLoggingOut}
          style={tw`rounded-2xl bg-red-500 p-4 shadow-lg ${isLoggingOut ? 'opacity-70' : ''}`}
        >
          {isLoggingOut ? (
            <View style={tw`flex-row items-center justify-center`}>
              <ActivityIndicator color="#ffffff" />
              <Text style={tw`ml-3 text-center text-base font-bold text-white`}>Cerrando sesión...</Text>
            </View>
          ) : (
            <Text style={tw`text-center text-base font-bold text-white`}>Cerrar Sesión</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
