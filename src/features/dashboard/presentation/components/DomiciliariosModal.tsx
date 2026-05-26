import { Modal, FlatList, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useDomiciliariosStore } from '@/features/admin/application/domiciliarios.store';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const DomiciliariosModal = ({ visible, onClose }: Props) => {
  const { list } = useDomiciliariosStore();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <ThemedView className="flex-1 mt-20 p-5 bg-white rounded-t-3xl">
        <ThemedText className="text-xl font-bold mb-4">Gestión de Domiciliarios</ThemedText>
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ThemedView className="p-3 border-b border-gray-200">
              <ThemedText>{item.nombre}</ThemedText>
              <ThemedText className="text-sm text-gray-500">{item.email}</ThemedText>
            </ThemedView>
          )}
        />
        <TouchableOpacity onPress={onClose} className="mt-5 p-3 bg-blue-600 rounded">
          <ThemedText className="text-white text-center">Cerrar</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </Modal>
  );
};