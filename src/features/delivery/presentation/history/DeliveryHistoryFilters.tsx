import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import tw from '@/lib/tailwind';
import {
	DeliveryHistoryFilterPatch,
	DeliveryHistoryFilterState,
} from '@/features/delivery/domain/delivery-history.types';

type DeliveryHistoryFiltersProps = {
	isDomiciliario: boolean;
	filters: DeliveryHistoryFilterState;
	resultCount: number;
	totalCount: number;
	timeFilterError: string | null;
	onChangeFilters: (filters: DeliveryHistoryFilterPatch) => void;
	onClearFilters: () => void;
};

export default function DeliveryHistoryFilters({
	isDomiciliario,
	filters,
	resultCount,
	totalCount,
	timeFilterError,
	onChangeFilters,
	onClearFilters,
}: DeliveryHistoryFiltersProps) {
	return (
		<View style={tw`mb-5 rounded-3xl border border-jj-blueDark/10 bg-white p-4 shadow-sm`}>
			<View style={tw`mb-4 flex-row items-center justify-between`}>
				<View>
					<Text style={tw`text-base font-bold text-jj-blueDark`}>
						Filtros
					</Text>
					<Text style={tw`text-xs text-jj-blueDark/60`}>
						Mostrando {resultCount} de {totalCount} pedido(s)
					</Text>
				</View>

				<TouchableOpacity
					testID="clear-history-filters"
					onPress={onClearFilters}
					style={tw`rounded-xl border border-jj-beige px-3 py-2`}
				>
					<Text style={tw`text-xs font-bold text-jj-blueDark`}>
						Limpiar
					</Text>
				</TouchableOpacity>
			</View>

			{!isDomiciliario ? (
				<View style={tw`mb-4`}>
					<Text style={tw`mb-2 text-xs font-bold uppercase tracking-wider text-jj-blueDark/70`}>
						Domiciliario
					</Text>
					<TextInput
						testID="search-historial-pedidos"
						value={filters.domiciliario}
						onChangeText={(value) => onChangeFilters({ domiciliario: value })}
						placeholder="Buscar por nombre o correo del domiciliario"
						placeholderTextColor="#718096"
						autoCapitalize="none"
						autoCorrect={false}
						style={tw`rounded-2xl border border-jj-beige bg-jj-beigeSoft px-4 py-3 text-sm text-jj-blueDark`}
					/>
				</View>
			) : null}

			<View style={tw`mb-4`}>
				<Text style={tw`mb-2 text-xs font-bold uppercase tracking-wider text-jj-blueDark/70`}>
					Pedido
				</Text>
				<TextInput
					testID="filter-historial-pedido"
					value={filters.pedido}
					onChangeText={(value) => onChangeFilters({ pedido: value })}
					placeholder="Buscar por ID, comercio, dirección, cliente, teléfono o valor"
					placeholderTextColor="#718096"
					autoCapitalize="none"
					autoCorrect={false}
					style={tw`rounded-2xl border border-jj-beige bg-jj-beigeSoft px-4 py-3 text-sm text-jj-blueDark`}
				/>
			</View>

			<View style={tw`flex-row gap-3`}>
				<View style={tw`flex-1`}>
					<Text style={tw`mb-2 text-xs font-bold uppercase tracking-wider text-jj-blueDark/70`}>
						Desde
					</Text>
					<TextInput
						testID="filter-historial-hora-inicio"
						value={filters.startTime}
						onChangeText={(value) => onChangeFilters({ startTime: value })}
						placeholder="08:00"
						placeholderTextColor="#718096"
						autoCapitalize="none"
						autoCorrect={false}
						maxLength={5}
						style={tw`rounded-2xl border border-jj-beige bg-jj-beigeSoft px-4 py-3 text-sm text-jj-blueDark`}
					/>
				</View>

				<View style={tw`flex-1`}>
					<Text style={tw`mb-2 text-xs font-bold uppercase tracking-wider text-jj-blueDark/70`}>
						Hasta
					</Text>
					<TextInput
						testID="filter-historial-hora-fin"
						value={filters.endTime}
						onChangeText={(value) => onChangeFilters({ endTime: value })}
						placeholder="18:30"
						placeholderTextColor="#718096"
						autoCapitalize="none"
						autoCorrect={false}
						maxLength={5}
						style={tw`rounded-2xl border border-jj-beige bg-jj-beigeSoft px-4 py-3 text-sm text-jj-blueDark`}
					/>
				</View>
			</View>

			{timeFilterError ? (
				<View style={tw`mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3`}>
					<Text style={tw`text-xs font-medium text-red-700`}>
						{timeFilterError}
					</Text>
				</View>
			) : null}
		</View>
	);
}