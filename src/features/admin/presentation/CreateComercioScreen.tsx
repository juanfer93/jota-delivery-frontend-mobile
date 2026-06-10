import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import tw from '@/lib/tailwind';
import { useAdminStore } from '@/features/admin/application/admin.store';
import { createComercioSchema } from '@/features/admin/domain/admin.schema';
import { CreateComercioDTO } from '@/features/admin/domain/admin.types';

const COLORS = {
  neutralGray: '#6b7280',
  neutralCard: '#ffffff',
};

export const CreateComercioScreen = () => {
  const {
    isCreatingComercio,
    comercioMessage,
    comercioError,
    clearComercioMessages,
    createComercio,
  } = useAdminStore();

  const [form, setForm] = useState<CreateComercioDTO>({
    nombre: '',
    direccion: '',
    telefono: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateComercioDTO, string>>>({});

  const validateForm = () => {
    const newErrors: Partial<Record<keyof CreateComercioDTO, string>> = {};

    try {
      createComercioSchema.parse(form);
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: any) => {
          if (err.path[0] === 'nombre') newErrors.nombre = err.message;
          if (err.path[0] === 'direccion') newErrors.direccion = err.message;
          if (err.path[0] === 'telefono') newErrors.telefono = err.message;
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    clearComercioMessages();

    if (!validateForm()) return;

    const success = await createComercio(form);
    if (success) {
      setForm({ nombre: '', direccion: '', telefono: '' });
      setErrors({});
    }
  };

  useEffect(() => {
    if (!comercioMessage && !comercioError) return;

    const timer = setTimeout(() => {
      clearComercioMessages();
    }, 5000);

    return () => clearTimeout(timer);
  }, [comercioMessage, comercioError, clearComercioMessages]);

  return (
    <ScrollView
      style={tw`flex-1 bg-jjBeigeSoft`}
      contentContainerStyle={tw`flex-grow justify-center items-center p-4`}
    >
      <View style={tw`w-full max-w-md bg-white shadow-lg rounded-xl p-6`}> 
        <Text testID="screen-title" style={tw`text-xl font-semibold text-jjBlue mb-2`}>
          Crear comercio
        </Text>

        <Text style={tw`text-sm text-jjBlueDark/70 mb-6`}>
          Registra un comercio para poder asignarle pedidos desde el tablero.
        </Text>

        <View style={tw`gap-4`}>
          <View style={tw`gap-1`}>
            <Text style={tw`text-sm font-medium text-jjBlueDark`}>Nombre</Text>
            <TextInput
              testID="nombre-input"
              style={tw`px-3 py-2 rounded-lg border border-jjBeige bg-jjBeigeSoft text-jjBlueDark`}
              value={form.nombre}
              onChangeText={(text) => {
                setForm((prev) => ({ ...prev, nombre: text }));
                if (errors.nombre) setErrors({ ...errors, nombre: undefined });
              }}
              placeholder="Nombre del comercio"
              placeholderTextColor={COLORS.neutralGray}
            />
            {errors.nombre && <Text style={tw`text-status-cancelado text-xs mt-1`}>{errors.nombre}</Text>}
          </View>

          <View style={tw`gap-1`}>
            <Text style={tw`text-sm font-medium text-jjBlueDark`}>Dirección</Text>
            <TextInput
              testID="direccion-input"
              style={tw`px-3 py-2 rounded-lg border border-jjBeige bg-jjBeigeSoft text-jjBlueDark`}
              value={form.direccion}
              onChangeText={(text) => {
                setForm((prev) => ({ ...prev, direccion: text }));
                if (errors.direccion) setErrors({ ...errors, direccion: undefined });
              }}
              placeholder="Dirección del comercio"
              placeholderTextColor={COLORS.neutralGray}
            />
            {errors.direccion && <Text style={tw`text-status-cancelado text-xs mt-1`}>{errors.direccion}</Text>}
          </View>

          <View style={tw`gap-1`}>
            <Text style={tw`text-sm font-medium text-jjBlueDark`}>Teléfono</Text>
            <TextInput
              testID="telefono-input"
              style={tw`px-3 py-2 rounded-lg border border-jjBeige bg-jjBeigeSoft text-jjBlueDark`}
              value={form.telefono}
              onChangeText={(text) => {
                setForm((prev) => ({ ...prev, telefono: text }));
                if (errors.telefono) setErrors({ ...errors, telefono: undefined });
              }}
              placeholder="Teléfono del comercio"
              placeholderTextColor={COLORS.neutralGray}
              keyboardType="phone-pad"
            />
            {errors.telefono && <Text style={tw`text-status-cancelado text-xs mt-1`}>{errors.telefono}</Text>}
          </View>

          <TouchableOpacity
            testID="submit-button"
            onPress={handleSubmit}
            disabled={isCreatingComercio}
            style={tw`mt-2 py-3 rounded-lg ${isCreatingComercio ? 'bg-jjBeige' : 'bg-jjBlue'}`}
          >
            {isCreatingComercio ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={tw`text-jjBeige text-center font-medium`}>Crear comercio</Text>
            )}
          </TouchableOpacity>
        </View>

        {comercioMessage && (
          <Text testID="success-message" style={tw`mt-4 text-status-hecho text-sm text-center`}> 
            {comercioMessage}
          </Text>
        )}

        {comercioError && (
          <Text testID="error-message" style={tw`mt-4 text-status-cancelado text-sm text-center`}>
            {comercioError}
          </Text>
        )}
      </View>
    </ScrollView>
  );
};
