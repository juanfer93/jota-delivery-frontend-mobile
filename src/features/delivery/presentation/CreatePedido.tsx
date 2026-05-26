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
    usuarioId: '',
    comercioId: '',
    valorFinal: '',
    direccionDestino: ''
  });

  const handleCreate = async () => {
    if (!form.usuarioId || !form.comercioId || !form.valorFinal || !form.direccionDestino) {
      return;
    }

    try {
      await assignPedido({
        usuarioId: form.usuarioId,
        comercioId: form.comercioId,
        valorFinal: Number(form.valorFinal),
        direccionDestino: form.direccionDestino,
      });
      router.back();
    } catch (e) {
      console.error(e);
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

          <View style={tw`rounded-3xl border border-jj-blueDark/10 bg-white/80 p-6 shadow-sm`}>
            
            <View style={tw`mb-5`}>
              <Text style={tw`text-sm font-medium text-jj-blueDark mb-2`}>ID Domiciliario</Text>
              <TextInput
                style={tw`w-full rounded-xl border border-jj-beige px-4 py-3 text-sm text-jj-blueDark bg-white`}
                placeholder="Ingresa ID"
                value={form.usuarioId}
                onChangeText={(text) => setForm({...form, usuarioId: text})}
              />
            </View>

            <View style={tw`mb-5`}>
              <Text style={tw`text-sm font-medium text-jj-blueDark mb-2`}>ID Comercio</Text>
              <TextInput
                style={tw`w-full rounded-xl border border-jj-beige px-4 py-3 text-sm text-jj-blueDark bg-white`}
                placeholder="Ingresa ID"
                value={form.comercioId}
                onChangeText={(text) => setForm({...form, comercioId: text})}
              />
            </View>

            <View style={tw`mb-5`}>
              <Text style={tw`text-sm font-medium text-jj-blueDark mb-2`}>Dirección Destino</Text>
              <TextInput
                style={tw`w-full rounded-xl border border-jj-beige px-4 py-3 text-sm text-jj-blueDark bg-white`}
                placeholder="Carrera 00 #00-00"
                value={form.direccionDestino}
                onChangeText={(text) => setForm({...form, direccionDestino: text})}
              />
            </View>

            <View style={tw`mb-8`}>
              <Text style={tw`text-sm font-medium text-jj-blueDark mb-2`}>Valor Pedido</Text>
              <TextInput
                style={tw`w-full rounded-xl border border-jj-beige px-4 py-3 text-sm text-jj-blueDark bg-white`}
                placeholder="0"
                value={form.valorFinal}
                onChangeText={(text) => setForm({...form, valorFinal: text})}
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