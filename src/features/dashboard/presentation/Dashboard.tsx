import { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, View, Text } from 'react-native';
import { useDeliveryStore } from '@/features/delivery/application/delivery.store';
import { router } from 'expo-router';
import { DomiciliariosModal } from './components/DomiciliariosModal';
import tw from '@/lib/tailwind';

export default function Dashboard() {
  const { pedidosHoy, domiciliarios, comercios, loadData, status } = useDeliveryStore();
  const [isDomiModalVisible, setIsDomiModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateDomi = () => {
    setIsDomiModalVisible(false);
    router.push('/domiciliarios/create');
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
          testID="btn-nav-crear-comercio"
          style={tw`bg-jjBlue p-3 rounded-lg flex-1 mr-2`}
          onPress={() => router.push('/comercios/create')}
        >
          <Text style={tw`text-jjBeige text-center font-bold`}>Comercios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`bg-jjBeige p-3 rounded-lg flex-1`}
          onPress={() => router.push('/delivery/create')}
        >
          <Text style={tw`text-jjBlueDark text-center font-bold`}>Crear Pedido</Text>
        </TouchableOpacity>
      </View>

      <View style={tw`mb-6 rounded-3xl border border-jjBeige bg-white p-5`}>
        <Text style={tw`text-2xl font-bold mb-4 text-jjBlueDark`}>Resumen</Text>
        <View style={tw`flex-row gap-3`}>
          <View style={tw`flex-1 rounded-3xl bg-jjBeigeSoft p-4`}>
            <Text style={tw`text-sm text-jjBlueDark/70`}>Pedidos Hoy</Text>
            <Text style={tw`text-3xl font-bold text-jjBlueDark`}>{pedidosHoy.length}</Text>
          </View>
          <View style={tw`flex-1 rounded-3xl bg-jjBeigeSoft p-4`}>
            <Text style={tw`text-sm text-jjBlueDark/70`}>Domiciliarios</Text>
            <Text style={tw`text-3xl font-bold text-jjBlueDark`}>{domiciliarios.length}</Text>
          </View>
          <View style={tw`flex-1 rounded-3xl bg-jjBeigeSoft p-4`}>
            <Text style={tw`text-sm text-jjBlueDark/70`}>Comercios</Text>
            <Text style={tw`text-3xl font-bold text-jjBlueDark`}>{comercios.length}</Text>
          </View>
        </View>
      </View>

      <Text style={tw`text-2xl font-bold mb-4 text-jjBlueDark`}>Pedidos de Hoy</Text>

      {status === 'loading' ? (
        <Text style={tw`text-jjBlueDark/70`}>Cargando...</Text>
      ) : pedidosHoy.length === 0 ? (
        <Text style={tw`text-jjBlueDark/70`}>No hay pedidos registrados.</Text>
      ) : (
        <FlatList
          data={pedidosHoy}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={tw`p-4 mb-2 bg-white rounded-3xl border border-jjBeige`}
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
        domiciliarios={domiciliarios}
        loadingList={status === 'loading'}
        errorList={null}
        onSelectDomiToDelete={(domi) => console.log(domi)}
        createDomi={false}
        handleCreateDomi={handleCreateDomi}
      />
    </View>
  );
}
