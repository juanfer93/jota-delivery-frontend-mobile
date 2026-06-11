import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/application/auth.store';
import tw from '@/lib/tailwind';

export function DeliveryDashboardClient() {
  const router = useRouter();
  const { user } = useAuthStore();

  const saldoNumero = user?.saldo ?? 0;
  const saldoFormateado = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(saldoNumero);

  return (
    <SafeAreaView style={tw`flex-1 bg-jj-beigeSoft`}>
      <ScrollView contentContainerStyle={tw`flex-1 px-4 pt-6 pb-4 max-w-[800px] w-full self-center`}>
        
        {/* Header Mejorado */}
        <View style={tw`mb-8 rounded-3xl bg-jj-blueDark p-6 shadow-lg`}>
          <Text style={tw`text-2xl font-bold text-jj-beigeSoft mb-1`}>Hola, {user?.nombre || 'Domiciliario'}</Text>
          <Text style={tw`text-sm text-jj-beigeSoft/80 mb-5`}>Bienvenido a tu panel de inicio</Text>
          
          <View style={tw`bg-jj-beigeSoft/10 rounded-2xl p-4 flex-row items-center justify-between`}>
            <View>
              <Text style={tw`text-jj-beigeSoft/80 text-xs uppercase tracking-wider mb-1`}>Tu Saldo Disponible</Text>
              <Text style={tw`text-3xl font-extrabold text-jj-beigeSoft`}>{saldoFormateado}</Text>
            </View>
            <View style={tw`w-12 h-12 rounded-full bg-jj-beigeSoft items-center justify-center shadow-sm`}>
              <Text style={tw`text-jj-blue text-xl`}>💰</Text>
            </View>
          </View>
        </View>

        <Text style={tw`text-lg font-semibold text-jj-blueDark mb-4 px-1`}>Menú Rápido</Text>

        <View style={tw`gap-3 pb-8`}>
          {/* Historial servicios */}
          <TouchableOpacity
            onPress={() => router.push('/delivery/history')}
            style={tw`w-full flex-row items-center py-3 px-4 rounded-xl bg-jj-blueDark shadow-sm`}
          >
            <View style={tw`w-10 h-10 rounded-full bg-jj-beigeSoft items-center justify-center mr-4`}>
              <Text style={tw`text-jj-blueDark text-xs font-extrabold`}>NEW</Text>
            </View>
            <Text style={tw`text-base text-jj-beigeSoft`}>Historial servicios</Text>
          </TouchableOpacity>

          {/* Servicio en curso */}
          <TouchableOpacity
            onPress={() => router.push('/profile/current-delivery')}
            style={tw`w-full flex-row items-center py-3 px-4 rounded-xl bg-jj-blueDark shadow-sm`}
          >
            <View style={tw`w-10 h-10 rounded-full bg-jj-beige items-center justify-center mr-4`}>
              <Text style={tw`text-jj-blueDark text-lg`}>⏱</Text>
            </View>
            <Text style={tw`text-base text-jj-beigeSoft`}>Servicio en curso</Text>
          </TouchableOpacity>

          {/* Cartera */}
          <TouchableOpacity
            // @ts-ignore
            onPress={() => router.push('/profile/wallet')}
            style={tw`w-full flex-row items-center py-3 px-4 rounded-xl bg-jj-blueDark shadow-sm`}
          >
            <View style={tw`w-10 h-10 rounded-full bg-jj-beige items-center justify-center mr-4`}>
              <Text style={tw`text-jj-blueDark text-lg`}>👛</Text>
            </View>
            <Text style={tw`text-base text-jj-beigeSoft`}>Cartera</Text>
          </TouchableOpacity>

          {/* Cambiar Contraseña */}
          <TouchableOpacity
            // @ts-ignore
            onPress={() => router.push('/profile/change-password')}
            style={tw`w-full flex-row items-center py-3 px-4 rounded-xl bg-jj-blueDark shadow-sm`}
          >
            <View style={tw`w-10 h-10 rounded-full bg-jj-beige items-center justify-center mr-4`}>
              <Text style={tw`text-jj-blueDark text-lg`}>🔒</Text>
            </View>
            <Text style={tw`text-base text-jj-beigeSoft`}>Cambiar Contraseña</Text>
          </TouchableOpacity>

          {/* Retirar */}
          <TouchableOpacity
            // @ts-ignore
            onPress={() => router.push('/profile/wallet')}
            style={tw`w-full flex-row items-center py-3 px-4 rounded-xl bg-jj-blueDark shadow-sm`}
          >
            <View style={tw`w-10 h-10 rounded-full bg-jj-beige items-center justify-center mr-4`}>
              <Text style={tw`text-jj-blueDark text-lg`}>💸</Text>
            </View>
            <Text style={tw`text-base text-jj-beigeSoft`}>Retirar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
