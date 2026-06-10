import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import tw from '@/lib/tailwind';
import { useDeliveryStore } from '@/features/delivery/application/delivery.store';
import { useRouter } from 'expo-router';
import { Comercio } from '@/features/admin/domain/admin.types';

export default function CreatePedido() {
  const { back } = useRouter();
  const { assignPedido, loadData, status, domiciliarios, comercios } = useDeliveryStore();

  const [form, setForm] = useState({
    direccionEntrega: '',
    valorPedido: '',
    detalles: '',
  });
  const [selectedDomiciliarioId, setSelectedDomiciliarioId] = useState<number | null>(null);
  const [selectedComercioId, setSelectedComercioId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (domiciliarios.length === 0 || comercios.length === 0) {
      loadData();
    }
  }, [domiciliarios.length, comercios.length, loadData]);

  const handleCreate = async () => {
    setSuccessMsg('');
    setErrorMsg('');

    if (!selectedDomiciliarioId || !selectedComercioId || !form.valorPedido || !form.direccionEntrega) {
      setErrorMsg('Todos los campos marcados son obligatorios.');
      return;
    }

    const created = await assignPedido({
      domiciliarioId: selectedDomiciliarioId,
      comercioId: selectedComercioId,
      valorPedido: Number(form.valorPedido),
      valorDomicilio: 0,
      clienteNombre: 'Cliente',
      clienteTelefono: '0000000000',
      direccionRecogida: 'No aplica',
      direccionEntrega: form.direccionEntrega,
      detallesAdicionales: form.detalles || undefined,
    });

    if (!created) {
      setErrorMsg('Error al crear el pedido. Revisa los datos e intenta de nuevo.');
      return;
    }

    setSuccessMsg('Pedido creado exitosamente.');
    setForm({ direccionEntrega: '', valorPedido: '', detalles: '' });
    setSelectedDomiciliarioId(null);
    setSelectedComercioId(null);
    setTimeout(() => back(), 1200);
  };

  const renderSelectionList = (
    items: { id: number; label: string; sublabel?: string }[],
    selectedId: number | null,
    onSelect: (id: number) => void,
    emptyMessage: string,
    prefix: string,
  ) => (
    <View style={tw`rounded-3xl border border-jj-blueDark/10 bg-white p-4 shadow-sm mb-6`}>
      {items.length === 0 ? (
        <Text style={tw`text-sm text-jj-blueDark/70`}>{emptyMessage}</Text>
      ) : (
        items.map((item) => (
          <TouchableOpacity
            key={item.id}
            testID={`${prefix}-option-${item.id}`}
            onPress={() => onSelect(item.id)}
            style={tw`mb-3 rounded-2xl border ${selectedId === item.id ? 'border-jjBlueDark bg-jjBlueDark/10' : 'border-jjBeige'} px-4 py-3`}
          >
            <Text style={tw`font-semibold text-jjBlueDark`}>{item.label}</Text>
            {item.sublabel ? <Text style={tw`text-xs text-jjBlueDark/60 mt-1`}>{item.sublabel}</Text> : null}
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const comercioOptions: { id: number; label: string; sublabel?: string }[] = comercios.map((comercio: Comercio) => ({
    id: comercio.id,
    label: comercio.nombre,
    sublabel: comercio.direccion,
  }));

  const domiciliarioOptions = domiciliarios.map((domi, idx) => {
    const rawId = (domi as any).id ?? (domi as any)._id ?? (domi as any).userId;
    const numericId = rawId != null && rawId !== '' ? Number(rawId) : NaN;
    const id = Number.isFinite(numericId) ? numericId : idx + 1; // fallback to 1-based index to keep testIDs stable

    return {
      id,
      label: domi.nombre ?? (domi as any).name ?? 'Domiciliario',
      sublabel: domi.email ?? '',
    };
  });

  return (
    <SafeAreaView style={tw`flex-1 bg-jjBeigeSoft`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <ScrollView contentContainerStyle={tw`p-6 justify-center max-w-[800px] w-full self-center`}>
          <View style={tw`rounded-3xl border border-jj-blueDark/10 bg-jj-blueDark p-6 shadow-lg mb-8`}>
            <Text style={tw`text-2xl font-semibold text-jj-beige`}>Nuevo Pedido</Text>
            <Text style={tw`text-xs uppercase tracking-widest text-jj-beige/80 mt-1`}>Asigna el pedido a un domiciliario y comercio existente.</Text>
          </View>

          <Text style={tw`mb-2 text-sm font-semibold text-jjBlueDark`}>Domiciliario</Text>
          {renderSelectionList(domiciliarioOptions, selectedDomiciliarioId, setSelectedDomiciliarioId, 'Cargando domiciliarios...', 'domiciliario')}

          <Text style={tw`mb-2 text-sm font-semibold text-jjBlueDark`}>Comercio</Text>
          {renderSelectionList(comercioOptions, selectedComercioId, setSelectedComercioId, 'Cargando comercios...', 'comercio')}

          <View style={tw`rounded-3xl border border-jj-blueDark/10 bg-white p-6 shadow-sm mb-6`}>
            <View style={tw`mb-5`}>
              <Text style={tw`text-sm font-medium text-jj-blueDark mb-2`}>Dirección Entrega</Text>
              <TextInput
                testID="direccionEntrega-input"
                style={tw`w-full rounded-xl border border-jj-beige px-4 py-3 text-sm text-jj-blueDark bg-white`}
                placeholder="Carrera 00 #00-00"
                value={form.direccionEntrega}
                onChangeText={(text) => setForm({ ...form, direccionEntrega: text })}
              />
            </View>

            <View style={tw`mb-5`}>
              <Text style={tw`text-sm font-medium text-jj-blueDark mb-2`}>Valor Pedido</Text>
              <TextInput
                testID="valorPedido-input"
                style={tw`w-full rounded-xl border border-jj-beige px-4 py-3 text-sm text-jj-blueDark bg-white`}
                placeholder="0"
                value={form.valorPedido}
                onChangeText={(text) => setForm({ ...form, valorPedido: text })}
                keyboardType="numeric"
              />
            </View>

            <View>
              <Text style={tw`text-sm font-medium text-jj-blueDark mb-2`}>Notas</Text>
              <TextInput
                testID="detalles-input"
                style={tw`w-full min-h-[100px] rounded-xl border border-jj-beige px-4 py-3 text-sm text-jj-blueDark bg-white`}
                placeholder="Detalle del pedido, instrucciones extras (opcional)"
                value={form.detalles}
                onChangeText={(text) => setForm({ ...form, detalles: text })}
                multiline
              />
            </View>
          </View>

          {successMsg ? (
            <View style={tw`mb-4 rounded-xl bg-green-100 border border-green-400 px-4 py-3`}>
              <Text style={tw`text-green-800 text-sm font-medium`}>{successMsg}</Text>
            </View>
          ) : null}
          {errorMsg ? (
            <View style={tw`mb-4 rounded-xl bg-red-100 border border-red-400 px-4 py-3`}>
              <Text style={tw`text-red-800 text-sm font-medium`}>{errorMsg}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            testID="create-pedido-button"
            onPress={handleCreate}
            disabled={status === 'loading'}
            style={tw`items-center justify-center rounded-2xl bg-jjBlue px-4 py-3.5 shadow-md ${status === 'loading' ? 'opacity-50' : ''}`}
          >
            {status === 'loading' ? (
              <ActivityIndicator color="#F5E9C8" />
            ) : (
              <Text style={tw`text-sm font-medium text-jj-beige`}>Registrar Pedido</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
