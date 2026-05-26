import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import tw from '@/lib/tailwind';
import { DomiciliarioItem } from './DomiciliariosModal';

type DeleteDomiciliarioModalProps = {
  isOpen: boolean;
  onClose: () => void;
  domiToDelete: DomiciliarioItem | null;
  onConfirm: () => void;
  isDeleting: boolean;
  errorDelete: string | null;
};

export function DeleteDomiciliarioModal({
  isOpen,
  onClose,
  domiToDelete,
  onConfirm,
  isDeleting,
  errorDelete
}: DeleteDomiciliarioModalProps) {
  return (
    <Modal visible={isOpen} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={tw`flex-1 justify-center items-center bg-black/50 px-4`}>
        <View style={tw`bg-white rounded-3xl shadow-lg w-full max-w-sm p-6`}>
          <Text style={tw`text-lg font-bold text-jj-blueDark mb-2`}>Eliminar Domiciliario</Text>

          <Text style={tw`text-sm text-jj-blueDark/80 mb-6`}>
            ¿Estás seguro que deseas eliminar a <Text style={tw`font-bold`}>{domiToDelete?.nombre}</Text>? Esta acción no se puede deshacer.
          </Text>

          {errorDelete && <Text style={tw`mb-4 text-xs text-red-600`}>{errorDelete}</Text>}

          <View style={tw`flex-row justify-end gap-3`}>
            <TouchableOpacity
              onPress={onClose}
              disabled={isDeleting}
              style={tw`px-4 py-2 rounded-xl bg-jj-beigeSoft border border-jj-beige`}
            >
              <Text style={tw`text-jj-blueDark font-bold text-sm`}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={isDeleting}
              style={tw`px-4 py-2 rounded-xl bg-status-cancelado flex-row items-center justify-center min-w-[80px]`}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={tw`text-white font-bold text-sm`}>Eliminar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}