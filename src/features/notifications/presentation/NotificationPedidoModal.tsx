import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '@/features/auth/application/auth.store';
import { useDeliveryStore } from '@/features/delivery/application/delivery.store';
import { PedidoEstado } from '@/features/delivery/domain/delivery.types';
import tw from '@/lib/tailwind';
import { NotificationReadRepository } from '../infrastructure/notification-read.repository';
import { useNotificationStore } from '../application/notification.store';
import { formatColombiaDateTime } from '@/core/time/colombia-time';

const STATUS_LABELS: Record<PedidoEstado, string> = {
  [PedidoEstado.EN_PROCESO]: 'En curso',
  [PedidoEstado.HECHO]: 'Hecho',
  [PedidoEstado.CANCELADO]: 'Cancelado',
};

export function NotificationPedidoModal() {
  const user = useAuthStore((state) => state.user);
  const notification = useNotificationStore((state) => state.activeNotification);
  const closeNotification = useNotificationStore((state) => state.closeNotification);
  const {
    currentDelivery, pedidosHoy, currentDeliveryStatus, loadCurrentDelivery,
    loadData, updateEstado,
  } = useDeliveryStore();
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<PedidoEstado | null>(null);
  const isDomiciliario = user?.rol === 'domiciliario';

  useEffect(() => {
    if (!notification) return;
    setActionError(null);

    if (notification.notificationId) {
      void NotificationReadRepository.markAsRead(notification.notificationId).catch((error: unknown) => {
        console.error('[NOTIFICATIONS] No se pudo marcar como leida.', error);
      });
    }

    void (isDomiciliario ? loadCurrentDelivery() : loadData());
  }, [notification, isDomiciliario, loadCurrentDelivery, loadData]);

  const pedido = useMemo(() => {
    if (!notification) return null;
    if (isDomiciliario) return currentDelivery?.id === notification.pedidoId ? currentDelivery : null;
    return pedidosHoy.find((item) => item.id === notification.pedidoId) ?? null;
  }, [currentDelivery, isDomiciliario, notification, pedidosHoy]);

  const handleStatus = async (estado: PedidoEstado) => {
    if (!notification) return;
    setUpdatingStatus(estado);
    setActionError(null);
    const updated = await updateEstado(notification.pedidoId, estado);
    setUpdatingStatus(null);
    if (updated) closeNotification();
    else setActionError('No se pudo actualizar el estado del pedido.');
  };

  const estado = pedido?.estado ?? notification?.estado;
  const finalizado = estado === PedidoEstado.HECHO || estado === PedidoEstado.CANCELADO;

  return (
    <Modal visible={!!notification} transparent animationType="fade" onRequestClose={closeNotification}>
      <View style={tw`flex-1 items-center justify-center bg-black/50 px-4`}>
        <View style={tw`w-full max-w-lg overflow-hidden rounded-3xl bg-jjBeigeSoft shadow-xl`}>
          <View style={tw`bg-jjBlueDark px-6 py-5`}>
            <Text style={tw`text-xl font-bold text-white`}>
              {notification?.title ?? (isDomiciliario ? 'Nuevo pedido' : 'Pedido actualizado')}
            </Text>
            {notification?.body ? <Text style={tw`mt-1 text-sm text-white/80`}>{notification.body}</Text> : null}
          </View>

          <ScrollView contentContainerStyle={tw`p-6`}>
            {currentDeliveryStatus === 'loading' && isDomiciliario ? (
              <ActivityIndicator color="#174A8B" />
            ) : (
              <View style={tw`gap-3`}>
                <Text style={tw`text-sm text-jjBlueDark`}>
                  <Text style={tw`font-bold`}>Pedido: </Text>{notification?.pedidoId}
                </Text>
                {pedido?.comercio?.nombre ? <Text style={tw`text-sm text-jjBlueDark`}><Text style={tw`font-bold`}>Comercio: </Text>{pedido.comercio.nombre}</Text> : null}
                {pedido?.direccionDestino ? <Text style={tw`text-sm text-jjBlueDark`}><Text style={tw`font-bold`}>Entrega: </Text>{pedido.direccionDestino}</Text> : null}
                {pedido?.clienteNombre ? <Text style={tw`text-sm text-jjBlueDark`}><Text style={tw`font-bold`}>Cliente: </Text>{pedido.clienteNombre}</Text> : null}
                {notification?.domiciliarioNombre ? <Text style={tw`text-sm text-jjBlueDark`}><Text style={tw`font-bold`}>Domiciliario: </Text>{notification.domiciliarioNombre}</Text> : null}
                {estado ? <Text style={tw`text-sm text-jjBlueDark`}><Text style={tw`font-bold`}>Estado: </Text>{STATUS_LABELS[estado]}</Text> : null}
                {notification?.createdAt ? <Text style={tw`text-sm text-jjBlueDark`}><Text style={tw`font-bold`}>Notificacion: </Text>{formatColombiaDateTime(notification.createdAt)}</Text> : null}
                {pedido?.createdAt ? <Text style={tw`text-sm text-jjBlueDark`}><Text style={tw`font-bold`}>Pedido creado: </Text>{formatColombiaDateTime(pedido.createdAt)}</Text> : null}
                {!pedido ? <Text style={tw`text-sm text-jjBlueDark/60`}>El detalle completo se sincronizara con el backend.</Text> : null}
              </View>
            )}

            {actionError ? <Text style={tw`mt-4 text-sm text-red-700`}>{actionError}</Text> : null}

            {isDomiciliario ? (
              <View style={tw`mt-6 gap-2`}>
                {Object.values(PedidoEstado).map((status) => (
                  <TouchableOpacity
                    key={status}
                    testID={`notification-status-${status}`}
                    disabled={!!updatingStatus || finalizado || estado === status}
                    onPress={() => handleStatus(status)}
                    style={tw`items-center rounded-xl px-4 py-3 ${finalizado || estado === status ? 'bg-jjBlueDark/30' : 'bg-jjBlueDark'} ${updatingStatus ? 'opacity-60' : ''}`}
                  >
                    <Text style={tw`font-bold text-white`}>{updatingStatus === status ? 'Actualizando...' : STATUS_LABELS[status]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            <TouchableOpacity onPress={closeNotification} style={tw`mt-4 items-center px-4 py-3`}>
              <Text style={tw`font-bold text-jjBlueDark`}>Cerrar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
