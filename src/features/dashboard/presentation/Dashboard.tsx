import { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useDeliveryStore } from '@/features/delivery/application/delivery.store';
import { router } from 'expo-router';
import { DomiciliariosModal } from './components/DomiciliariosModal';

export default function Dashboard() {
  const { pedidosHoy, loadData, status } = useDeliveryStore();
  const [isDomiModalVisible, setIsDomiModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  return (
    <ThemedView className="flex-1 p-4">
      <ThemedView className="flex-row justify-between mb-6">
        <TouchableOpacity 
          className="bg-blue-600 p-3 rounded-lg flex-1 mr-2"
          onPress={() => setIsDomiModalVisible(true)}
        >
          <ThemedText className="text-white text-center font-bold">Domiciliarios</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-green-600 p-3 rounded-lg flex-1"
          // onPress={() => setIsComercioModalVisible(true)}
        >
          <ThemedText className="text-white text-center font-bold">Comercios</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedText className="text-2xl font-bold mb-4">Pedidos de Hoy</ThemedText>

      {status === 'loading' ? (
        <ThemedText>Cargando...</ThemedText>
      ) : (
        <FlatList
          data={pedidosHoy}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="p-4 mb-2 bg-gray-100 rounded-lg"
              onPress={() => router.push(`/delivery/${item.id}` as any)}
            >
              <ThemedText>Dirección: {item.direccionDestino}</ThemedText>
              <ThemedText>Estado: {item.estado}</ThemedText>
            </TouchableOpacity>
          )}
        />
      )}

      <DomiciliariosModal 
        visible={isDomiModalVisible} 
        onClose={() => setIsDomiModalVisible(false)} 
      />
    </ThemedView>
  );
}