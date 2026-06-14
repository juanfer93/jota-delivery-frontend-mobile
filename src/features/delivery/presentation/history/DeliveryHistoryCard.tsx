import { View, Text } from 'react-native';
import tw from '@/lib/tailwind';
import { formatColombiaDateTime } from '@/core/time/colombia-time';
import { Pedido, PedidoEstado } from '@/features/delivery/domain/delivery.types';
import { DeliveryHistoryStatusStyle } from '@/features/delivery/domain/delivery-history.types';
import { formatMoney } from '@/features/delivery/presentation/history/delivery-history.filters';

const STATUS_STYLES: Record<PedidoEstado, DeliveryHistoryStatusStyle> = {
	[PedidoEstado.EN_PROCESO]: {
		badge: 'bg-jjBlue/15',
		text: 'text-jjBlue',
	},
	[PedidoEstado.HECHO]: {
		badge: 'bg-status-hecho/20',
		text: 'text-status-hecho',
	},
	[PedidoEstado.CANCELADO]: {
		badge: 'bg-status-cancelado/20',
		text: 'text-status-cancelado',
	},
};

type DeliveryHistoryCardProps = {
	pedido: Pedido;
	isDomiciliario: boolean;
};

export default function DeliveryHistoryCard({
	pedido,
	isDomiciliario,
}: DeliveryHistoryCardProps) {
	return (
		<View style={tw`bg-white p-5 rounded-3xl border border-jj-blueDark/5 shadow-sm`}>
			<View style={tw`flex-row justify-between items-center mb-3`}>
				<Text style={tw`font-bold text-jj-blue`}>
					ID: {pedido.id.slice(-6)}
				</Text>

				<View style={tw`${STATUS_STYLES[pedido.estado].badge} px-3 py-1 rounded-full`}>
					<Text style={tw`${STATUS_STYLES[pedido.estado].text} text-xs font-bold`}>
						{pedido.estado}
					</Text>
				</View>
			</View>

			<Text style={tw`text-sm text-jj-blueDark/80`}>
				Dirección: {pedido.direccionDestino}
			</Text>

			{pedido.direccionRecogida ? (
				<Text style={tw`mt-1 text-sm text-jj-blueDark/80`}>
					Recogida: {pedido.direccionRecogida}
				</Text>
			) : null}

			<Text style={tw`mt-2 text-sm text-jj-blueDark/80`}>
				Comercio: {pedido.comercio?.nombre ?? 'Sin comercio'}
			</Text>

			{!isDomiciliario ? (
				<Text style={tw`mt-1 text-sm text-jj-blueDark/80`}>
					Domiciliario: {pedido.usuario?.nombre ?? 'Sin domiciliario'}
				</Text>
			) : null}

			{pedido.clienteNombre ? (
				<Text style={tw`mt-1 text-sm text-jj-blueDark/80`}>
					Cliente: {pedido.clienteNombre}
				</Text>
			) : null}

			{pedido.clienteTelefono ? (
				<Text style={tw`mt-1 text-sm text-jj-blueDark/80`}>
					Teléfono: {pedido.clienteTelefono}
				</Text>
			) : null}

			{pedido.detallesAdicionales ? (
				<Text style={tw`mt-1 text-sm text-jj-blueDark/80`}>
					Detalles: {pedido.detallesAdicionales}
				</Text>
			) : null}

			<Text style={tw`text-sm font-bold mt-2 text-jj-blueDark`}>
				Valor: ${formatMoney(pedido.valorFinal)}
			</Text>

			<Text style={tw`mt-2 text-xs text-jj-blueDark/60`}>
				Creado: {formatColombiaDateTime(pedido.createdAt)}
			</Text>

			{pedido.updatedAt ? (
				<Text style={tw`mt-1 text-xs text-jj-blueDark/60`}>
					Actualizado: {formatColombiaDateTime(pedido.updatedAt)}
				</Text>
			) : null}
		</View>
	);
}