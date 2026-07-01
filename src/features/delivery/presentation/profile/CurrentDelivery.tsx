import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { useDeliveryStore } from "@/features/delivery/application/delivery.store";
import { formatColombiaDateTime } from '@/core/time/colombia-time';
import { CurrentDeliveryItem, PedidoEstado } from '@/features/delivery/domain/delivery.types';
import { formatRouteSummary, getCourierEarnings, getPickupAddress } from '@/features/delivery/presentation/delivery.utils';

type UpdatingState = {
  id: string;
  estado: PedidoEstado;
} | null;

const formatCOP = (n: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
};

interface DeliveryCardProps {
  delivery: CurrentDeliveryItem;
  index: number;
  total: number;
  updating: UpdatingState;
  onStatus: (deliveryId: string, estado: PedidoEstado) => void;
}

function DeliveryCard({
  delivery,
  index,
  total,
  updating,
  onStatus,
}: DeliveryCardProps) {
  const comercioNombre = delivery.comercio?.nombre ?? "Comercio";
  const comercioDireccion = getPickupAddress(delivery);
  const valorFinal = Number(delivery.valorFinal ?? 0);
  const ganancia = getCourierEarnings(delivery);
  const finalizado = delivery.estado === PedidoEstado.HECHO || delivery.estado === PedidoEstado.CANCELADO;
  const isUpdating = updating?.id === delivery.id;
  const finishTestId = index === 0 ? 'current-delivery-finish' : `current-delivery-${delivery.id}-finish`;
  const cancelTestId = index === 0 ? 'current-delivery-cancel' : `current-delivery-${delivery.id}-cancel`;

  return (
    <View
      testID={index === 0 ? 'current-delivery-card' : `current-delivery-card-${delivery.id}`}
      style={tw`mb-5 overflow-hidden rounded-3xl bg-[#174A8B] shadow-lg border border-[#F5E9C8]`}
    >
      <View style={tw`px-5 py-4`}>
        <View style={tw`items-center mb-4`}>
          <View style={tw`bg-[#FFF9E8] px-4 py-2 rounded-full`}>
            <Text style={tw`text-[#174A8B] font-semibold text-sm`}>{comercioNombre}</Text>
          </View>
        </View>

        <View style={tw`border-t border-[#F5E9C8]/40 my-2`} />

        <Text style={tw`text-xs font-bold uppercase tracking-[2px] text-[#FFF9E8]/70`}>
          {total > 1 ? `Servicio activo ${index + 1}/${total}` : 'Servicio activo'}
        </Text>
        <Text style={tw`mt-1 text-2xl font-bold text-[#FFF9E8]`}>Pedido en proceso</Text>
        <Text style={tw`mt-2 text-sm font-semibold leading-5 text-[#FFF9E8]`}>
          {formatRouteSummary(delivery)}
        </Text>

        <View style={tw`border-t border-[#F5E9C8]/40 my-4`} />

        <Text style={tw`text-sm font-semibold mt-2 mb-1 text-[#FFF9E8]`}>IR A RESTAURANTE</Text>
        <Text style={tw`text-sm mb-3 text-[#FFF9E8]`}>{comercioDireccion}</Text>

        <Text style={tw`text-sm font-semibold mb-1 text-[#FFF9E8]`}>Entrega A:</Text>
        <Text style={tw`text-sm mb-3 text-[#FFF9E8]`}>{delivery.direccionDestino}</Text>

        <View style={tw`border-t border-[#F5E9C8]/40 my-2`} />

        <Text style={tw`text-sm text-[#FFF9E8] mb-1`}>
          <Text style={tw`font-semibold`}>Estado: </Text>{delivery.estado}
        </Text>
        <Text style={tw`text-sm text-[#FFF9E8] mb-1`}>
          <Text style={tw`font-semibold`}>Pedido creado: </Text>{formatColombiaDateTime(delivery.createdAt)}
        </Text>
        {delivery.assignedAt ? (
          <Text style={tw`text-sm text-[#FFF9E8] mb-1`}>
            <Text style={tw`font-semibold`}>Asignado: </Text>{formatColombiaDateTime(delivery.assignedAt)}
          </Text>
        ) : null}
        {delivery.clienteNombre ? (
          <Text style={tw`text-sm text-[#FFF9E8] mb-1`}>
            <Text style={tw`font-semibold`}>Cliente: </Text>{delivery.clienteNombre}
          </Text>
        ) : null}
        {delivery.clienteTelefono ? (
          <Text style={tw`text-sm text-[#FFF9E8] mb-1`}>
            <Text style={tw`font-semibold`}>Telefono: </Text>{delivery.clienteTelefono}
          </Text>
        ) : null}
        {delivery.detallesAdicionales ? (
          <Text style={tw`text-sm text-[#FFF9E8] mb-1`}>
            <Text style={tw`font-semibold`}>Detalles: </Text>{delivery.detallesAdicionales}
          </Text>
        ) : null}

        <View style={tw`border-t border-[#F5E9C8]/40 my-2`} />

        <View style={tw`mt-3`}>
          <Text style={tw`text-sm text-[#FFF9E8] mb-1`}>
            <Text style={tw`font-semibold`}>Valor compra: </Text>{formatCOP(valorFinal)}
          </Text>
          <Text style={tw`text-sm text-[#FFF9E8] mb-1`}>
            <Text style={tw`font-semibold`}>Ganancia: </Text>{formatCOP(ganancia)}
          </Text>
        </View>
      </View>

      <View style={tw`border-t border-[#F5E9C8]/30 bg-[#0F3565] px-5 py-4 gap-3`}>
        <TouchableOpacity
          testID={finishTestId}
          disabled={finalizado || !!updating}
          onPress={() => onStatus(delivery.id, PedidoEstado.HECHO)}
          style={tw`rounded-2xl bg-green-700 px-4 py-4 ${finalizado || updating ? 'opacity-50' : ''}`}
        >
          <Text style={tw`text-center font-bold text-white`}>
            {isUpdating && updating?.estado === PedidoEstado.HECHO ? 'Actualizando...' : 'Finalizar servicio'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID={cancelTestId}
          disabled={finalizado || !!updating}
          onPress={() => onStatus(delivery.id, PedidoEstado.CANCELADO)}
          style={tw`rounded-2xl bg-red-600 px-4 py-4 ${finalizado || updating ? 'opacity-50' : ''}`}
        >
          <Text style={tw`text-center font-bold text-white`}>
            {isUpdating && updating?.estado === PedidoEstado.CANCELADO ? 'Actualizando...' : 'Cancelar servicio'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function CurrentDelivery() {
  const router = useRouter();
  const {
    currentDelivery,
    currentDeliveries = [],
    currentDeliveryStatus,
    currentDeliveryError,
    loadCurrentDelivery,
    updateEstado,
  } = useDeliveryStore();
  const [updating, setUpdating] = useState<UpdatingState>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentDelivery();
  }, [loadCurrentDelivery]);

  const activeDeliveries = useMemo(
    () => currentDeliveries.length > 0 ? currentDeliveries : currentDelivery ? [currentDelivery] : [],
    [currentDeliveries, currentDelivery],
  );

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/delivery');
    }
  };

  const handleStatus = async (deliveryId: string, estado: PedidoEstado) => {
    setUpdating({ id: deliveryId, estado });
    setStatusError(null);
    const ok = await updateEstado(deliveryId, estado, { refresh: 'current' });
    setUpdating(null);

    if (!ok) {
      setStatusError('No se pudo actualizar el estado del pedido.');
      return;
    }

    if (activeDeliveries.length <= 1) {
      router.replace('/(app)/delivery');
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
          <Text style={tw`mt-4 text-[#030303]`}>Cargando servicios en curso...</Text>
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

  if (activeDeliveries.length === 0) {
    return (
      <SafeAreaView style={tw`flex-1 bg-[#FFF9E8]`}>
        <View style={tw`bg-[#174A8B] pt-4 pb-3 px-4 flex-row justify-between items-center`}>
          <Text style={tw`font-semibold text-sm text-[#FFF9E8]`}>Detalles</Text>
          <TouchableOpacity onPress={handleClose}>
            <Text style={tw`text-sm text-[#FFF9E8] underline`}>Cerrar</Text>
          </TouchableOpacity>
        </View>
        <View style={tw`flex-1 items-center justify-center px-4`}>
          <Text style={tw`text-[#030303] text-center`}>No tienes ningun servicio en curso.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-[#FFF9E8]`}>
      <View style={tw`bg-[#174A8B] pt-4 pb-3 px-4 flex-row justify-between items-center z-10`}>
        <Text style={tw`font-semibold text-sm text-[#FFF9E8]`}>
          {activeDeliveries.length > 1 ? `${activeDeliveries.length} servicios` : 'Detalles'}
        </Text>
        <TouchableOpacity onPress={handleClose}>
          <Text style={tw`text-sm text-[#FFF9E8] underline`}>Cerrar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`px-4 pt-5 pb-6`}
        showsVerticalScrollIndicator={false}
      >
        {activeDeliveries.map((delivery, index) => (
          <DeliveryCard
            key={delivery.id}
            delivery={delivery}
            index={index}
            total={activeDeliveries.length}
            updating={updating}
            onStatus={handleStatus}
          />
        ))}

        {statusError ? <Text style={tw`mt-1 text-sm font-semibold text-red-700`}>{statusError}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
