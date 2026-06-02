import { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, View, Text } from 'react-native';
import { useDeliveryStore } from '@/features/delivery/application/delivery.store';
import { router } from 'expo-router';
import { DomiciliariosModal } from './components/DomiciliariosModal';
import tw from '@/lib/tailwind';

export default function Dashboard() {
  const { pedidosHoy, loadData, status } = useDeliveryStore();
  const [isDomiModalVisible, setIsDomiModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDomi = () => {
    setIsDomiModalVisible(false);
    router.push('/(admin)/domiciliarios/create');
  };

  return (
    <View style={tw`flex-1 p-4 bg-jjBeigeSoft`}>
      <View style={tw`flex-row justify-between mb-6`}>
        <TouchableOpacity
          testID="btn-nav-crear-domiciliario"
          style={tw`bg-jjBlue p-3 rounded-lg flex-1 mr-2`}
          onPress={() => setIsDomiModalVisible(true)}
        >
          <Text style={tw`text-jjBeige text-center font-bold`}>Domiciliarios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`bg-jjBeige p-3 rounded-lg flex-1`}
        >
          <Text style={tw`text-jjBlueDark text-center font-bold`}>Comercios</Text>
        </TouchableOpacity>
      </View>

      <Text style={tw`text-2xl font-bold mb-4 text-jjBlueDark`}>Pedidos de Hoy</Text>

      {status === 'loading' ? (
        <Text style={tw`text-jjBlueDark/70`}>Cargando...</Text>
      ) : (
        <FlatList
          data={pedidosHoy}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={tw`p-4 mb-2 bg-white rounded-lg border border-jjBeige`}
              onPress={() => router.push(`/delivery/${item.id}` as any)}
            >
              <Text style={tw`text-jjBlueDark font-medium`}>Dirección: {item.direccionEntrega}</Text>
              <Text style={tw`text-jjBlueDark/70 text-sm`}>Estado: {item.estado}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <DomiciliariosModal
        isOpen={isDomiModalVisible}
        onClose={() => setIsDomiModalVisible(false)}
        domiciliarios={[]}
        loadingList={false}
        errorList={null}
        onSelectDomiToDelete={(domi) => console.log(domi)}
        createDomi={false}
        handleCreateDomi={handleCreateDomi}
      />
    </View>
  );
}