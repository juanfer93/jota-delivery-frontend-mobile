import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { useDeliveryStore } from "@/features/delivery/application/delivery.store";
import { formatColombiaDateTime } from '@/core/time/colombia-time';
import { PedidoEstado } from '@/features/delivery/domain/delivery.types';

export function CurrentDelivery() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const { currentDelivery, currentDeliveryStatus, currentDeliveryError, loadCurrentDelivery, updateEstado } = useDeliveryStore();
  const [updating, setUpdating] = useState<PedidoEstado | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentDelivery();
  }, [loadCurrentDelivery]);

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/delivery');
    }
  };

  const handleStatus = async (estado: PedidoEstado) => {
    if (!currentDelivery) return;
    setUpdating(estado);
    setStatusError(null);
    const ok = await updateEstado(currentDelivery.id, estado, { refresh: 'current' });
    setUpdating(null);
    if (!ok) {
      setStatusError('No se pudo actualizar el estado del pedido.');
      return;
    }
    router.replace('/(app)/delivery');
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
  const finalizado = currentDelivery.estado === PedidoEstado.HECHO || currentDelivery.estado === PedidoEstado.CANCELADO;
  const cardHeight = Math.max(320, Math.round(height * 0.5));

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

      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`px-4 pt-5 pb-6`}
        showsVerticalScrollIndicator={false}
      >
        <View
          testID="current-delivery-card"
          style={[
            tw`bg-[#174A8B] rounded-3xl shadow-lg px-5 py-4 border border-[#F5E9C8]`,
            { height: cardHeight },
          ]}
        >
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            <View style={tw`items-center mb-4`}>
              <View style={tw`bg-[#FFF9E8] px-4 py-2 rounded-full`}>
                <Text style={tw`text-[#174A8B] font-semibold text-sm`}>{comercioNombre}</Text>
              </View>
            </View>

            <View style={tw`border-t border-[#F5E9C8]/40 my-2`} />

            <Text style={tw`text-sm font-semibold mt-2 mb-1 text-[#FFF9E8]`}>IR A RESTAURANTE</Text>
            <Text style={tw`text-sm mb-3 text-[#FFF9E8]`}>{comercioDireccion}</Text>

            <Text style={tw`text-sm font-semibold mb-1 text-[#FFF9E8]`}>Entrega A:</Text>
            <Text style={tw`text-sm mb-3 text-[#FFF9E8]`}>{currentDelivery.direccionDestino}</Text>

            <View style={tw`border-t border-[#F5E9C8]/40 my-2`} />

            <Text style={tw`text-sm text-[#FFF9E8] mb-1`}>
              <Text style={tw`font-semibold`}>Estado: </Text>{currentDelivery.estado}
            </Text>
            <Text style={tw`text-sm text-[#FFF9E8] mb-1`}>
              <Text style={tw`font-semibold`}>Pedido creado: </Text>{formatColombiaDateTime(currentDelivery.createdAt)}
            </Text>
            {currentDelivery.assignedAt ? (
              <Text style={tw`text-sm text-[#FFF9E8] mb-1`}>
                <Text style={tw`font-semibold`}>Asignado: </Text>{formatColombiaDateTime(currentDelivery.assignedAt)}
              </Text>
            ) : null}

            <View style={tw`border-t border-[#F5E9C8]/40 my-2`} />

            <View style={tw`mt-3`}>
              <Text style={tw`text-sm text-[#FFF9E8] mb-1`}>
                <Text style={tw`font-semibold`}>Valor compra: </Text>{formatCOP(valorFinal)}
              </Text>
              <Text style={tw`text-sm text-[#FFF9E8]`}>
                <Text style={tw`font-semibold`}>Domicilio: </Text>{formatCOP(valorDomicilio)}
              </Text>
            </View>
          </ScrollView>
        </View>

        {statusError ? <Text style={tw`mt-4 text-sm font-semibold text-red-700`}>{statusError}</Text> : null}

        <View style={tw`mt-5 gap-3`}>
          <TouchableOpacity
            testID="current-delivery-finish"
            disabled={finalizado || !!updating}
            onPress={() => void handleStatus(PedidoEstado.HECHO)}
            style={tw`rounded-2xl bg-green-700 px-4 py-4 ${finalizado || updating ? 'opacity-50' : ''}`}
          >
            <Text style={tw`text-center font-bold text-white`}>{updating === PedidoEstado.HECHO ? 'Actualizando...' : 'Finalizar servicio'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="current-delivery-cancel"
            disabled={finalizado || !!updating}
            onPress={() => void handleStatus(PedidoEstado.CANCELADO)}
            style={tw`rounded-2xl bg-red-600 px-4 py-4 ${finalizado || updating ? 'opacity-50' : ''}`}
          >
            <Text style={tw`text-center font-bold text-white`}>{updating === PedidoEstado.CANCELADO ? 'Actualizando...' : 'Cancelar servicio'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
