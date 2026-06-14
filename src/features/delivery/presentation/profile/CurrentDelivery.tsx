import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { useDeliveryStore } from "@/features/delivery/application/delivery.store";
import { formatColombiaDateTime } from '@/core/time/colombia-time';

export function CurrentDelivery() {
  const router = useRouter();
  const { currentDelivery, currentDeliveryStatus, currentDeliveryError, loadCurrentDelivery } = useDeliveryStore();

  useEffect(() => {
    loadCurrentDelivery();
  }, [loadCurrentDelivery]);

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/delivery');
    }
  };

  if (currentDeliveryStatus === 'loading') {
    return (
      <SafeAreaView style={tw`flex-1 bg-[#FFF9E8]`}>
        <View style={tw`bg-[#174A8B] pt-4 pb-3 px-4 flex-row justify-between items-center`}>
          <Text style={tw`font-semibold text-sm text-[#FFF9E8]`}>Detalles</Text>
          <TouchableOpacity onPress={handleClose}>
            <Text style={tw`text-sm text-[#FFF9E8] underline`}>Cerrar</Text>
          </TouchableOpacity>
        </View>
        <View style={tw`flex-1 items-center justify-center px-4`}>
          <ActivityIndicator size="large" color="#174A8B" />
          <Text style={tw`mt-4 text-[#030303]`}>Cargando servicio en curso...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (currentDeliveryError) {
    return (
      <SafeAreaView style={tw`flex-1 bg-[#FFF9E8]`}>
        <View style={tw`bg-[#174A8B] pt-4 pb-3 px-4 flex-row justify-between items-center`}>
          <Text style={tw`font-semibold text-sm text-[#FFF9E8]`}>Detalles</Text>
          <TouchableOpacity onPress={handleClose}>
            <Text style={tw`text-sm text-[#FFF9E8] underline`}>Cerrar</Text>
          </TouchableOpacity>
        </View>
        <View style={tw`flex-1 items-center justify-center px-4`}>
          <Text style={tw`text-[#030303]`}>{currentDeliveryError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentDelivery) {
    return (
      <SafeAreaView style={tw`flex-1 bg-[#FFF9E8]`}>
        <View style={tw`bg-[#174A8B] pt-4 pb-3 px-4 flex-row justify-between items-center`}>
          <Text style={tw`font-semibold text-sm text-[#FFF9E8]`}>Detalles</Text>
          <TouchableOpacity onPress={handleClose}>
            <Text style={tw`text-sm text-[#FFF9E8] underline`}>Cerrar</Text>
          </TouchableOpacity>
        </View>
        <View style={tw`flex-1 items-center justify-center px-4`}>
          <Text style={tw`text-[#030303] text-center`}>No tienes ningún servicio en curso.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const comercioNombre = currentDelivery.comercio?.nombre ?? "Comercio";
  const comercioDireccion = currentDelivery.comercio?.direccion ?? "Dirección no disponible";
  const valorFinal = Number(currentDelivery.valorFinal ?? 0);
  const valorDomicilio = Number(currentDelivery.valorDomicilio ?? 0);

  const formatCOP = (n: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(n);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#FFF9E8]`}>
      <View style={tw`bg-[#174A8B] pt-4 pb-3 px-4 flex-row justify-between items-center z-10`}>
        <Text style={tw`font-semibold text-sm text-[#FFF9E8]`}>Detalles</Text>
        <TouchableOpacity onPress={handleClose}>
          <Text style={tw`text-sm text-[#FFF9E8] underline`}>Cerrar</Text>
        </TouchableOpacity>
      </View>

      <View style={tw`h-40 bg-[#F5E9C8]`} />

      <ScrollView style={tw`flex-1 -mt-8 px-4 pb-6`}>
        <View style={tw`bg-[#174A8B] rounded-3xl shadow-lg px-5 py-4 border border-[#F5E9C8]`}>
          <View style={tw`items-center mb-4`}>
            <View style={tw`bg-[#FFF9E8] px-4 py-2 rounded-full`}>
              <Text style={tw`text-[#174A8B] font-semibold text-sm`}>
                {comercioNombre}
              </Text>
            </View>
          </View>

          <View style={tw`border-t border-[#F5E9C8]/40 my-2`} />

          <Text style={tw`text-sm font-semibold mt-2 mb-1 text-[#FFF9E8]`}>
            IR A RESTAURANTE
          </Text>
          <Text style={tw`text-sm mb-3 text-[#FFF9E8]`}>{comercioDireccion}</Text>

          <Text style={tw`text-sm font-semibold mb-1 text-[#FFF9E8]`}>Entrega A:</Text>
          <Text style={tw`text-sm mb-3 text-[#FFF9E8]`}>{currentDelivery.direccionDestino}</Text>

          <View style={tw`border-t border-[#F5E9C8]/40 my-2`} />

          <Text style={tw`text-sm text-[#FFF9E8] mb-1`}>
            <Text style={tw`font-semibold`}>Pedido creado: </Text>
            {formatColombiaDateTime(currentDelivery.createdAt)}
          </Text>
          {currentDelivery.assignedAt ? (
            <Text style={tw`text-sm text-[#FFF9E8] mb-1`}>
              <Text style={tw`font-semibold`}>Asignado: </Text>
              {formatColombiaDateTime(currentDelivery.assignedAt)}
            </Text>
          ) : null}

          <View style={tw`border-t border-[#F5E9C8]/40 my-2`} />

          <View style={tw`mt-3`}>
            <Text style={tw`text-sm text-[#FFF9E8] mb-1`}>
              <Text style={tw`font-semibold`}>Valor compra: </Text>
              {formatCOP(valorFinal)}
            </Text>
            <Text style={tw`text-sm text-[#FFF9E8]`}>
              <Text style={tw`font-semibold`}>Domicilio: </Text>
              {formatCOP(valorDomicilio)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
