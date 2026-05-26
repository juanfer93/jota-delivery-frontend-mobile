import { Modal, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import tw from '@/lib/tailwind';

export interface DomiciliarioItem {
  id: string;
  nombre: string;
  email: string;
}

type DomiciliariosModalProps = {
  isOpen: boolean;
  onClose: () => void;
  domiciliarios: DomiciliarioItem[];
  loadingList: boolean;
  errorList: string | null;
  onSelectDomiToDelete: (domi: DomiciliarioItem) => void;
  createDomi: boolean;
  handleCreateDomi: () => void;
};

export function DomiciliariosModal({
  isOpen,
  onClose,
  domiciliarios,
  loadingList,
  errorList,
  onSelectDomiToDelete,
  handleCreateDomi,
  createDomi,
}: DomiciliariosModalProps) {
  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 justify-center items-center bg-black/40 px-4`}>

        <View style={tw`bg-jj-beigeSoft rounded-3xl shadow-lg w-full max-w-md p-6 relative`}>

          <TouchableOpacity
            onPress={onClose}
            style={tw`absolute right-5 top-5 z-10 p-2`}
          >
            <Text style={tw`text-jj-blueDark/70 font-bold text-lg`}>✕</Text>
          </TouchableOpacity>

          <Text style={tw`text-xl font-semibold text-jj-blueDark`}>
            Domiciliarios
          </Text>
          <Text style={tw`mt-1 text-sm text-jj-blue/80`}>
            Lista de domiciliarios registrados.
          </Text>

          <View style={tw`mt-5 max-h-[300px]`}>
            {loadingList && (
              <View style={tw`py-4`}>
                <ActivityIndicator color={tw.color('jj-blue')} />
                <Text style={tw`text-xs text-jj-blue/80 text-center mt-2`}>Cargando...</Text>
              </View>
            )}

            {!loadingList && domiciliarios.length === 0 && (
              <Text style={tw`text-sm text-jj-blue/80 text-center py-4`}>
                No hay domiciliarios registrados.
              </Text>
            )}

            {!loadingList && domiciliarios.length > 0 && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {domiciliarios.map((domi) => (
                  <View
                    key={domi.id}
                    style={tw`flex-row items-center justify-between bg-jj-blueDark rounded-2xl px-4 py-3 mb-3`}
                  >
                    <View style={tw`flex-1 mr-2`}>
                      <Text style={tw`text-sm font-semibold text-jj-beige`} numberOfLines={1}>
                        {domi.nombre}
                      </Text>
                      <Text style={tw`text-xs text-jj-beige/80`} numberOfLines={1}>
                        {domi.email}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => onSelectDomiToDelete(domi)}
                      style={tw`px-3 py-1.5 rounded-full bg-jj-beige`}
                    >
                      <Text style={tw`text-xs text-jj-blueDark font-bold`}>
                        Eliminar
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {errorList && (
            <Text style={tw`mt-3 text-xs text-red-600`}>{errorList}</Text>
          )}

          <View style={tw`mt-6 flex-row justify-end`}>
            <TouchableOpacity
              onPress={handleCreateDomi}
              disabled={createDomi}
              style={tw`px-5 py-3 rounded-full bg-jj-blueDark shadow-md ${createDomi ? 'opacity-50' : ''}`}
            >
              <Text style={tw`text-jj-beige text-xs font-bold`}>
                {createDomi ? "Cargando..." : "Crear Domiciliario"}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}