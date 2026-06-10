import { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import tw from '@/lib/tailwind';
import { useAuthStore } from '@/features/auth/application/auth.store';
import { router } from 'expo-router';

export function ProfileAdminClient() {
  const { user, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const name = (user as any)?.nombre || (user as any)?.name || (user as any)?.email || 'Administrador';

  const handleLogout = async () => {
    console.log('🔐 [PROFILE] Cerrar sesión iniciado');
    setIsLoggingOut(true);
    try {
      await logout();
      console.log('🔐 [PROFILE] Logout completado, redirigiendo a /login');
      router.replace('/login' as any);
    } catch (error: any) {
      console.error('❌ [PROFILE] Error durante logout:', error?.message || error);
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

        <View style={tw`bg-white p-5 rounded-2xl border border-jj-blueDark/10 mb-6`}>
          <Text style={tw`font-bold text-jj-blueDark mb-2`}>Información de cuenta</Text>
          <Text style={tw`text-jj-blueDark/80 mb-1`}>Email: {(user as any)?.email || '—'}</Text>
          <Text style={tw`text-jj-blueDark/80`}>Rol: {(user as any)?.rol || '—'}</Text>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          disabled={isLoggingOut}
          style={tw`bg-red-500 p-4 rounded-2xl shadow-lg ${isLoggingOut ? 'opacity-70' : ''}`}
        >
          {isLoggingOut ? (
            <View style={tw`flex-row justify-center items-center`}> 
              <ActivityIndicator color="#ffffff" />
              <Text style={tw`text-white text-center font-bold text-base ml-3`}>Cerrando sesión...</Text>
            </View>
          ) : (
            <Text style={tw`text-white text-center font-bold text-base`}>Cerrar Sesión</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ProfileDeliveryClient() {

	return (
		<SafeAreaView style={tw`flex-1 bg-jj-beigeSoft`}>
			<ScrollView contentContainerStyle={tw`p-6 max-w-[800px] w-full self-center`}>

				<View style={tw`mb-8`}>
					<Text style={tw`text-2xl font-bold text-jj-blueDark`}>Hola, Repartidor</Text>
					<Text style={tw`text-sm text-jj-blueDark/60`}>Gestiona tus pedidos del día</Text>
				</View>

				<TouchableOpacity
					onPress={() => router.push('/delivery/current')}
					style={tw`bg-jj-blueDark p-6 rounded-3xl shadow-lg mb-6`}
				>
					<Text style={tw`text-jj-beige text-xs uppercase tracking-widest font-bold mb-1`}>Estado actual</Text>
					<Text style={tw`text-xl text-white font-semibold`}>Ver pedido en curso</Text>
				</TouchableOpacity>

				<View style={tw`gap-4`}>
					<TouchableOpacity
						style={tw`bg-white p-5 rounded-2xl border border-jj-blueDark/10 flex-row justify-between items-center`}
						onPress={() => router.push('/delivery/history')}
					>
						<Text style={tw`font-bold text-jj-blueDark`}>Historial de pedidos</Text>
						<Text style={tw`text-jj-blue font-bold`}>→</Text>
					</TouchableOpacity>
				</View>

			</ScrollView>
		</SafeAreaView>
	);
}