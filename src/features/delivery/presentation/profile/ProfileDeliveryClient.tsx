import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import tw from '@/lib/tailwind';
import { useRouter } from 'expo-router';

export function ProfileDeliveryClient() {
	const router = useRouter();

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