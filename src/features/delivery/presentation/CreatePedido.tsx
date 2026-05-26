import { useState } from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useDeliveryStore } from '@/features/delivery/application/delivery.store';
import { router } from 'expo-router';

export default function CreatePedido() {
  const { assignPedido, status } = useDeliveryStore();
  const [direccion, setDireccion] = useState('');
  const [valor, setValor] = useState('');

  const handleCreate = async () => {
    await assignPedido({
      usuarioId: 'some-id',
      comercioId: 'some-comercio-id',
      valorFinal: Number(valor),
      direccionDestino: direccion,
    });
    router.back();
  };

  return (
    <ThemedView className="flex-1 p-5">
      <ThemedText className="text-xl font-bold mb-4">Nuevo Pedido</ThemedText>

      <TextInput
        placeholder="Dirección de destino"
        value={direccion}
        onChangeText={setDireccion}
        className="p-3 border border-gray-300 rounded mb-4"
      />

      <TextInput
        placeholder="Valor del pedido"
        value={valor}
        onChangeText={setValor}
        keyboardType="numeric"
        className="p-3 border border-gray-300 rounded mb-4"
      />

      <TouchableOpacity
        onPress={handleCreate}
        disabled={status === 'loading'}
        className="bg-blue-600 p-4 rounded"
      >
        <ThemedText className="text-white text-center font-bold">
          {status === 'loading' ? 'Creando...' : 'Crear Pedido'}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}