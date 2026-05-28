import { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, 
  KeyboardAvoidingView, Platform, SafeAreaView, ScrollView 
} from 'react-native';
import tw from '@/lib/tailwind';
import { useDeliveryStore } from '@/features/delivery/application/delivery.store';
import { router } from 'expo-router';

export default function CreatePedido() {
  const { assignPedido, status } = useDeliveryStore();
  
  const [form, setForm] = useState({
    domiciliarioId: '', 
    comercioId: '',
    valorPedido: '',    
    direccionEntrega: '' 
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg]     = useState('');

  const handleCreate = async () => {
    if (!form.domiciliarioId || !form.comercioId || !form.valorPedido || !form.direccionEntrega) {
      setErrorMsg('Todos los campos son obligatorios');
      return;
    }

    setSuccessMsg('');
    setErrorMsg('');

    try {
      await assignPedido({
        domiciliarioId:   Number(form.domiciliarioId), 
        comercioId:       Number(form.comercioId),
        valorPedido:      Number(form.valorPedido),
        valorDomicilio:   0, 
        clienteNombre:    'Cliente', 
        clienteTelefono:  '0000000', 
        direccionRecogida:'N/A', 
        direccionEntrega: form.direccionEntrega,
      });

      setSuccessMsg('Pedido creado exitosamente');
      setTimeout(() => router.back(), 1500);

    } catch (e: any) {
      console.error('❌ Error al crear pedido:', e?.response?.data ?? e?.message ?? e);
      setErrorMsg('Error al crear el pedido. Revisa los datos.');
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-jj-beigeSoft`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <ScrollView contentContainerStyle={tw`p-6 justify-center max-w-[800px] w-full self-center`}>
          
          <View style={tw`rounded-3xl border border-jj-blueDark/10 bg-jj-blueDark p-6 shadow-lg mb-8`}>
            <Text style={tw`text-2xl font-semibold text-jj-beige`}>Nuevo Pedido</Text>
            <Text style={tw`text-xs uppercase tracking-widest text-jj-beige/80 mt-1`}>Configuración de entrega</Text>
          </View>

          {successMsg !== '' && (
            <View style={tw`mb-4 rounded-xl bg-green-100 border border-green-400 px-4 py-3`}>
              <Text style={tw`text-green-800 text-sm font-medium`}>{successMsg}</Text>
            </View>
          )}

          {errorMsg !== '' && (
            <View style={tw`mb-4 rounded-xl bg-red-100 border border-red-400 px-4 py-3`}>
              <Text style={tw`text-red-800 text-sm font-medium`}>{errorMsg}</Text>
            </View>
          )}

          <View style={tw`rounded-3xl border border-jj-blueDark/10 bg-white/80 p-6 shadow-sm`}>
            
            <View style={tw`mb-5`}>
              <Text style={tw`text-sm font-medium text-jj-blueDark mb-2`}>ID Domiciliario</Text>
              <TextInput
                style={tw`w-full rounded-xl border border-jj-beige px-4 py-3 text-sm text-jj-blueDark bg-white`}
                placeholder="Ingresa ID"
                value={form.domiciliarioId}
                onChangeText={(text) => setForm({...form, domiciliarioId: text})}
                keyboardType="numeric"
              />
            </View>

            <View style={tw`mb-5`}>
              <Text style={tw`text-sm font-medium text-jj-blueDark mb-2`}>ID Comercio</Text>
              <TextInput
                style={tw`w-full rounded-xl border border-jj-beige px-4 py-3 text-sm text-jj-blueDark bg-white`}
                placeholder="Ingresa ID"
                value={form.comercioId}
                onChangeText={(text) => setForm({...form, comercioId: text})}
                keyboardType="numeric"
              />
            </View>

            <View style={tw`mb-5`}>
              <Text style={tw`text-sm font-medium text-jj-blueDark mb-2`}>Dirección Entrega</Text>
              <TextInput
                style={tw`w-full rounded-xl border border-jj-beige px-4 py-3 text-sm text-jj-blueDark bg-white`}
                placeholder="Carrera 00 #00-00"
                value={form.direccionEntrega}
                onChangeText={(text) => setForm({...form, direccionEntrega: text})}
              />
            </View>

            <View style={tw`mb-8`}>
              <Text style={tw`text-sm font-medium text-jj-blueDark mb-2`}>Valor Pedido</Text>
              <TextInput
                style={tw`w-full rounded-xl border border-jj-beige px-4 py-3 text-sm text-jj-blueDark bg-white`}
                placeholder="0"
                value={form.valorPedido}
                onChangeText={(text) => setForm({...form, valorPedido: text})}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              onPress={handleCreate}
              disabled={status === 'loading'}
              style={tw`items-center justify-center rounded-2xl bg-jj-blue px-4 py-3.5 shadow-md ${status === 'loading' ? 'opacity-50' : ''}`}
            >
              {status === 'loading' ? (
                <ActivityIndicator color="#F5E9C8" />
              ) : (
                <Text style={tw`text-sm font-medium text-jj-beige`}>Registrar Pedido</Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}