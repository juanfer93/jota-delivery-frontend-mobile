import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/features/auth/application/auth.store';
import { useDeliveryStore } from '@/features/delivery/application/delivery.store';
import { PedidoEstado } from '@/features/delivery/domain/delivery.types';
import tw from '@/lib/tailwind';
import { NotificationReadRepository } from '../infrastructure/notification-read.repository';
import { useNotificationStore } from '../application/notification.store';
import { formatColombiaDateTime } from '@/core/time/colombia-time';
import { getNotificationRoute } from '../application/notification-navigation';

const STATUS_LABELS: Record<PedidoEstado, string> = {
  [PedidoEstado.EN_PROCESO]: 'En curso',
  [PedidoEstado.HECHO]: 'Finalizar servicio',
  [PedidoEstado.CANCELADO]: 'Cancelar servicio',
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

  const handlePrimaryAction = () => {
    if (!notification) return;
    const route = getNotificationRoute(notification);
    closeNotification();
    router.push(route as any);
  };

  const estado = pedido?.estado ?? notification?.estado;
  const finalizado = estado === PedidoEstado.HECHO || estado === PedidoEstado.CANCELADO;
  const visible = !!notification;
  const amount = typeof pedido?.valorFinal === 'number' ? pedido.valorFinal.toLocaleString('es-CO') : null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={closeNotification}>
      <View style={tw`flex-1 justify-end bg-black/50`}>
        <View style={tw`max-h-[88%] overflow-hidden rounded-t-3xl bg-jjBeigeSoft shadow-xl`}>
          <View style={tw`bg-jjBlueDark px-6 pt-5 pb-4`}>
            <Text style={tw`text-xs uppercase tracking-[2px] text-jj-beige/80`}>
              {isDomiciliario ? 'Servicio disponible' : 'Actualizacion de pedido'}
            </Text>
            <Text style={tw`mt-1 text-2xl font-bold text-jj-beige`}>
              {notification?.title ?? (isDomiciliario ? 'Nuevo pedido asignado' : 'Pedido actualizado')}
            </Text>
            {notification?.body ? (
              <Text style={tw`mt-2 text-sm text-jj-beige/90`}>
                {notification.body}
              </Text>
            ) : null}
          </View>

          <ScrollView contentContainerStyle={tw`p-6 pb-8`}>
            {currentDeliveryStatus === 'loading' && isDomiciliario ? (
              <View style={tw`items-center py-8`}>
                <ActivityIndicator color="#174A8B" />
                <Text style={tw`mt-3 text-sm text-jjBlueDark/70`}>
                  Consultando los datos del servicio...
                </Text>
              </View>
            ) : (
              <View style={tw`gap-3`}>
                {amount ? (
                  <View style={tw`items-center rounded-3xl bg-white p-5 shadow-sm`}>
                    <Text style={tw`text-xs uppercase tracking-[2px] text-jjBlueDark/60`}>
                      Valor pedido
                    </Text>
                    <Text style={tw`mt-1 text-3xl font-bold text-jjBlueDark`}>
                      ${amount}
                    </Text>
                  </View>
                ) : null}

                <View style={tw`rounded-3xl bg-white p-5 shadow-sm`}>
                  <Text style={tw`mb-3 text-sm font-bold uppercase tracking-[1.5px] text-jjBlueDark/60`}>
                    Detalles del servicio
                  </Text>
                  <Text style={tw`text-sm text-jjBlueDark`}>
                    <Text style={tw`font-bold`}>Pedido: </Text>{notification?.pedidoId}
                  </Text>
                  {pedido?.comercio?.nombre ? (
                    <Text style={tw`mt-2 text-sm text-jjBlueDark`}>
                      <Text style={tw`font-bold`}>Comercio: </Text>{pedido.comercio.nombre}
                    </Text>
                  ) : null}
                  {pedido?.direccionDestino ? (
                    <Text style={tw`mt-2 text-sm text-jjBlueDark`}>
                      <Text style={tw`font-bold`}>Entrega: </Text>{pedido.direccionDestino}
                    </Text>
                  ) : null}
                  {pedido?.clienteNombre ? (
                    <Text style={tw`mt-2 text-sm text-jjBlueDark`}>
                      <Text style={tw`font-bold`}>Cliente: </Text>{pedido.clienteNombre}
                    </Text>
                  ) : null}
                  {notification?.domiciliarioNombre ? (
                    <Text style={tw`mt-2 text-sm text-jjBlueDark`}>
                      <Text style={tw`font-bold`}>Domiciliario: </Text>{notification.domiciliarioNombre}
                    </Text>
                  ) : null}
                  {estado ? (
                    <Text style={tw`mt-2 text-sm text-jjBlueDark`}>
                      <Text style={tw`font-bold`}>Estado: </Text>
                      {estado === PedidoEstado.EN_PROCESO ? 'En curso' : estado === PedidoEstado.HECHO ? 'Hecho' : 'Cancelado'}
                    </Text>
                  ) : null}
                  {notification?.createdAt ? (
                    <Text style={tw`mt-2 text-sm text-jjBlueDark/70`}>
                      <Text style={tw`font-bold`}>Notificacion: </Text>{formatColombiaDateTime(notification.createdAt)}
                    </Text>
                  ) : null}
                  {!pedido ? (
                    <Text style={tw`mt-3 text-sm text-jjBlueDark/60`}>
                      El detalle completo se sincronizara con el backend al abrir el servicio.
                    </Text>
                  ) : null}
                </View>
              </View>
            )}

            {actionError ? <Text style={tw`mt-4 text-sm text-red-700`}>{actionError}</Text> : null}

            <View style={tw`mt-6 flex-row gap-3`}>
              <TouchableOpacity
                testID="notification-dismiss-button"
                onPress={closeNotification}
                style={tw`flex-1 items-center rounded-2xl border border-jjBlueDark/20 bg-white px-4 py-3.5`}
              >
                <Text style={tw`font-bold text-jjBlueDark`}>
                  No tomar ahora
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="notification-primary-action"
                onPress={handlePrimaryAction}
                style={tw`flex-1 items-center rounded-2xl bg-jjBlue px-4 py-3.5`}
              >
                <Text style={tw`font-bold text-white`}>
                  {isDomiciliario ? 'Tomar servicio' : 'Ver pedido'}
                </Text>
              </TouchableOpacity>
            </View>

            {isDomiciliario ? (
              <View style={tw`mt-5 gap-2`}>
                {[PedidoEstado.HECHO, PedidoEstado.CANCELADO].map((status) => (
                  <TouchableOpacity
                    key={status}
                    testID={`notification-status-${status}`}
                    disabled={!!updatingStatus || finalizado}
                    onPress={() => handleStatus(status)}
                    style={tw`items-center rounded-xl px-4 py-3 ${finalizado ? 'bg-jjBlueDark/30' : status === PedidoEstado.HECHO ? 'bg-green-700' : 'bg-red-600'} ${updatingStatus ? 'opacity-60' : ''}`}
                  >
                    <Text style={tw`font-bold text-white`}>
                      {updatingStatus === status ? 'Actualizando...' : STATUS_LABELS[status]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
