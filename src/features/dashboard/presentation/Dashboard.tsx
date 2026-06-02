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
    <View style={tw`flex-1 p-4 bg-gray-50`}>
      <View style={tw`flex-row justify-between mb-6`}>
        <TouchableOpacity
          testID="btn-nav-crear-domiciliario"
          style={tw`bg-blue-600 p-3 rounded-lg flex-1 mr-2`}
          onPress={() => setIsDomiModalVisible(true)}
        >
          <Text style={tw`text-white text-center font-bold`}>Domiciliarios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`bg-green-600 p-3 rounded-lg flex-1`}
        >
          <Text style={tw`text-white text-center font-bold`}>Comercios</Text>
        </TouchableOpacity>
      </View>

      <Text style={tw`text-2xl font-bold mb-4 text-gray-900`}>Pedidos de Hoy</Text>

      {status === 'loading' ? (
        <Text style={tw`text-gray-600`}>Cargando...</Text>
      ) : (
        <FlatList
          data={pedidosHoy}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={tw`p-4 mb-2 bg-gray-100 rounded-lg`}
              onPress={() => router.push(`/delivery/${item.id}` as any)}
            >
              <Text style={tw`text-gray-900`}>Dirección: {item.direccionEntrega}</Text>
              <Text style={tw`text-gray-700`}>Estado: {item.estado}</Text>
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