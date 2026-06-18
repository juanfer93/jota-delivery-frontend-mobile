import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { useDeliveryStore } from '@/features/delivery/application/delivery.store';
import { PedidoEstado } from '@/features/delivery/domain/delivery.types';

type AssignmentMode = 'queue' | 'manual';

export default function CreatePedido() {
  const router = useRouter();
  const {
    assignPedido,
    loadData,
    status,
    comercios,
    domiciliarios,
    pedidosHoy,
    error,
  } = useDeliveryStore();

  const [form, setForm] = useState({ direccionDestino: '', valorFinal: '', detalles: '' });
  const [selectedComercioId, setSelectedComercioId] = useState<string | null>(null);
  const [selectedDomiciliarioId, setSelectedDomiciliarioId] = useState<string | null>(null);
  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>('queue');
  const [manualPanelOpen, setManualPanelOpen] = useState(false);
  const [domiciliarioSearch, setDomiciliarioSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (comercios.length === 0 || domiciliarios.length === 0) {
      void loadData();
    }
  }, [comercios.length, domiciliarios.length, loadData]);

  const busyIds = useMemo(
    () => new Set(
      pedidosHoy
        .filter((pedido) => pedido.estado === PedidoEstado.EN_PROCESO && !!(pedido.domiciliarioId ?? pedido.usuarioId))
        .map((pedido) => pedido.domiciliarioId ?? pedido.usuarioId)
        .filter(Boolean),
    ),
    [pedidosHoy],
  );

  const selectedDomiciliario = useMemo(
    () => domiciliarios.find((domi) => domi.id === selectedDomiciliarioId),
    [domiciliarios, selectedDomiciliarioId],
  );

  const filteredDomiciliarios = domiciliarios.filter((domiciliario) => {
    const term = domiciliarioSearch.trim().toLowerCase();
    if (!term) return true;
    return `${domiciliario.nombre || ''} ${domiciliario.email || ''}`.toLowerCase().includes(term);
  });

  const handleCreate = async () => {
    setSuccessMsg('');
    setErrorMsg('');

    const valorFinal = Number(form.valorFinal);

    if (!selectedComercioId || !form.valorFinal || !form.direccionDestino.trim()) {
      setErrorMsg('Todos los campos marcados son obligatorios.');
      return;
    }

    if (!Number.isFinite(valorFinal) || valorFinal <= 0) {
      setErrorMsg('El valor del pedido debe ser un numero positivo.');
      return;
    }

    if (assignmentMode === 'manual' && !selectedDomiciliarioId) {
      setErrorMsg('Selecciona un domiciliario para asignacion manual.');
      setManualPanelOpen(true);
      return;
    }

    if (assignmentMode === 'manual' && selectedDomiciliarioId && busyIds.has(selectedDomiciliarioId)) {
      setErrorMsg('Ese domiciliario ya tiene un pedido activo.');
      setManualPanelOpen(true);
      return;
    }

    const created = await assignPedido({
      comercioId: selectedComercioId,
      valorFinal,
      valorDomicilio: 0,
      direccionDestino: form.direccionDestino.trim(),
      detallesAdicionales: form.detalles.trim() || undefined,
      ...(assignmentMode === 'manual' && selectedDomiciliarioId ? { domiciliarioId: selectedDomiciliarioId } : {}),
    });

    if (!created) {
      setErrorMsg(error || 'Error al crear el pedido. Revisa los datos e intenta de nuevo.');
      return;
    }

    setSuccessMsg(
      assignmentMode === 'manual'
        ? 'Pedido creado y asignado manualmente.'
        : 'Pedido creado en lista libre. Los domiciliarios fueron notificados.',
    );

    setForm({ direccionDestino: '', valorFinal: '', detalles: '' });
    setSelectedComercioId(null);
    setSelectedDomiciliarioId(null);
    setDomiciliarioSearch('');
    setManualPanelOpen(false);
    setAssignmentMode('queue');
    router.replace('/(app)/delivery' as any);
  };

  const renderChoice = (item: { id: string; label: string; sublabel?: string; disabled?: boolean }, selectedId: string | null, onSelect: (id: string) => void, prefix: string) => (
    <TouchableOpacity
      key={item.id}
      testID={`${prefix}-option-${item.id}`}
      disabled={item.disabled}
      onPress={() => onSelect(item.id)}
      style={tw`mb-3 rounded-2xl border ${selectedId === item.id ? 'border-jjBlueDark bg-jjBlueDark/10' : 'border-jjBeige'} px-4 py-3 ${item.disabled ? 'opacity-40' : ''}`}
    >
      <Text style={tw`font-semibold text-jjBlueDark`}>{item.label}</Text>
      {item.sublabel ? <Text style={tw`text-xs text-jjBlueDark/60 mt-1`}>{item.sublabel}</Text> : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-jjBeigeSoft`}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <ScrollView contentContainerStyle={tw`p-6 justify-center max-w-[800px] w-full self-center`}>
          <View style={tw`rounded-3xl border border-jj-blueDark/10 bg-jj-blueDark p-6 shadow-lg mb-8`}>
            <Text style={tw`text-2xl font-semibold text-jj-beige`}>Nuevo Pedido</Text>
            <Text style={tw`text-xs uppercase tracking-widest text-jj-beige/80 mt-1`}>Lista libre o asignacion manual.</Text>
          </View>

          <View style={tw`rounded-3xl border border-jj-blueDark/10 bg-white p-4 shadow-sm mb-4`}>
            <Text style={tw`text-sm font-semibold text-jjBlueDark mb-1`}>Lista de pedidos</Text>
            <Text style={tw`text-xs text-jjBlueDark/70`}>El pedido queda visible para todos los domiciliarios libres.</Text>
            <TouchableOpacity
              testID="assignment-queue-button"
              onPress={() => {
                setAssignmentMode('queue');
                setSelectedDomiciliarioId(null);
                setManualPanelOpen(false);
              }}
              style={tw`mt-4 rounded-2xl border px-4 py-3 ${assignmentMode === 'queue' ? 'border-jjBlueDark bg-jjBlueDark/10' : 'border-jjBeige bg-white'}`}
            >
              <Text style={tw`text-center font-semibold text-jjBlueDark`}>Enviar a lista</Text>
            </TouchableOpacity>
          </View>

          <View style={tw`rounded-3xl border border-jj-blueDark/10 bg-white p-4 shadow-sm mb-6`}>
            <Text style={tw`text-sm font-semibold text-jjBlueDark mb-1`}>Asignacion manual</Text>
            <Text style={tw`text-xs text-jjBlueDark/70 mb-3`}>Busca un domiciliario libre y asignale el pedido directamente.</Text>
            {selectedDomiciliario ? (
              <View style={tw`mb-3 rounded-2xl bg-jjBlueDark/10 px-4 py-3`}>
                <Text style={tw`text-sm font-semibold text-jjBlueDark`}>Seleccionado: {selectedDomiciliario.nombre || selectedDomiciliario.email}</Text>
                <Text style={tw`text-xs text-jjBlueDark/60 mt-1`}>{selectedDomiciliario.email}</Text>
              </View>
            ) : null}
            <TouchableOpacity
              testID="open-manual-assignment-button"
              onPress={() => {
                setAssignmentMode('manual');
                setManualPanelOpen((current) => !current);
              }}
              style={tw`rounded-2xl border px-4 py-3 ${assignmentMode === 'manual' ? 'border-jjBlueDark bg-jjBlueDark/10' : 'border-jjBeige bg-white'}`}
            >
              <Text style={tw`text-center font-semibold text-jjBlueDark`}>{manualPanelOpen ? 'Cerrar lista de domiciliarios' : 'Abrir lista de domiciliarios'}</Text>
            </TouchableOpacity>

            {manualPanelOpen ? (
              <View testID="manual-assignment-panel" style={tw`mt-4`}>
                <TextInput
                  testID="domiciliario-search-input"
                  style={tw`mb-3 w-full rounded-xl border border-jj-beige px-4 py-3 text-sm text-jj-blueDark bg-white`}
                  placeholder="Buscar por nombre o correo"
                  placeholderTextColor="#718096"
                  value={domiciliarioSearch}
                  onChangeText={setDomiciliarioSearch}
                />
                <View style={tw`rounded-3xl border border-jj-blueDark/10 bg-white p-4 shadow-sm mb-6`}>
                  {filteredDomiciliarios.length === 0 ? <Text style={tw`text-sm text-jj-blueDark/70`}>No hay domiciliarios que coincidan.</Text> : null}
                  {filteredDomiciliarios.map((domiciliario) => {
                    const isBusy = busyIds.has(domiciliario.id);
                    const isUnconfirmed = domiciliario.email_confirmado === false;
                    const disabled = isBusy || isUnconfirmed || !!domiciliario.bloqueado;
                    return renderChoice(
                      {
                        id: domiciliario.id,
                        label: domiciliario.nombre || domiciliario.email,
                        sublabel: isBusy ? 'Ocupado con pedido activo' : isUnconfirmed ? 'Pendiente por confirmar correo' : domiciliario.email,
                        disabled,
                      },
                      selectedDomiciliarioId,
                      (id) => {
                        setSelectedDomiciliarioId(id);
                        setAssignmentMode('manual');
                        setManualPanelOpen(false);
                      },
                      'domiciliario',
                    );
                  })}
                </View>
              </View>
            ) : null}
          </View>

          <Text style={tw`mb-2 text-sm font-semibold text-jjBlueDark`}>Comercio</Text>
          <View style={tw`rounded-3xl border border-jj-blueDark/10 bg-white p-4 shadow-sm mb-6`}>
            {comercios.map((comercio) => renderChoice(
              { id: comercio.id, label: comercio.nombre, sublabel: comercio.direccion },
              selectedComercioId,
              setSelectedComercioId,
              'comercio',
            ))}
          </View>

          <View style={tw`rounded-3xl border border-jj-blueDark/10 bg-white p-6 shadow-sm mb-6`}>
            <View style={tw`mb-5`}>
              <Text style={tw`text-sm font-medium text-jj-blueDark mb-2`}>Direccion Entrega</Text>
              <TextInput
                testID="direccionDestino-input"
                style={tw`w-full rounded-xl border border-jj-beige px-4 py-3 text-sm text-jj-blueDark bg-white`}
                placeholder="Carrera 00 #00-00"
                placeholderTextColor="#718096"
                value={form.direccionDestino}
                onChangeText={(text) => setForm({ ...form, direccionDestino: text })}
              />
            </View>

            <View style={tw`mb-5`}>
              <Text style={tw`text-sm font-medium text-jj-blueDark mb-2`}>Valor Pedido</Text>
              <TextInput
                testID="valorFinal-input"
                style={tw`w-full rounded-xl border border-jj-beige px-4 py-3 text-sm text-jj-blueDark bg-white`}
                placeholder="0"
                placeholderTextColor="#718096"
                value={form.valorFinal}
                onChangeText={(text) => setForm({ ...form, valorFinal: text })}
                keyboardType="numeric"
              />
            </View>

            <View>
              <Text style={tw`text-sm font-medium text-jjBlueDark mb-2`}>Notas</Text>
              <TextInput
                testID="detalles-input"
                style={tw`w-full min-h-[100px] rounded-xl border border-jj-beige px-4 py-3 text-sm text-jj-blueDark bg-white`}
                placeholder="Detalle del pedido, instrucciones extras (opcional)"
                placeholderTextColor="#718096"
                value={form.detalles}
                onChangeText={(text) => setForm({ ...form, detalles: text })}
                multiline
              />
            </View>
          </View>

          {successMsg ? <View style={tw`mb-4 rounded-xl bg-green-100 border border-green-400 px-4 py-3`}><Text style={tw`text-green-800 text-sm font-medium`}>{successMsg}</Text></View> : null}
          {errorMsg ? <View style={tw`mb-4 rounded-xl bg-red-100 border border-red-400 px-4 py-3`}><Text style={tw`text-red-800 text-sm font-medium`}>{errorMsg}</Text></View> : null}

          <TouchableOpacity
            testID="create-pedido-button"
            onPress={handleCreate}
            disabled={status === 'loading'}
            style={tw`items-center justify-center rounded-2xl bg-jjBlue px-4 py-3.5 shadow-md ${status === 'loading' ? 'opacity-50' : ''}`}
          >
            {status === 'loading' ? <ActivityIndicator color="#F5E9C8" /> : <Text style={tw`text-sm font-medium text-jj-beige`}>Registrar Pedido</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
