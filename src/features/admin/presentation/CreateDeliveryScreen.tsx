import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import tw from '@/lib/tailwind';
import { useAdminStore } from '@/features/admin/application/admin.store';
import { createDomiciliarioSchema } from '@/features/admin/domain/admin.schema';

const COLORS = {
  neutralGray: '#6b7280',
  neutralCard: '#ffffff',
};

export const CreateDeliveryScreen = () => {
  const {
    isCreatingDomiciliario,
    domiciliarioMessage,
    domiciliarioError,
    lastTemporaryPassword,
    clearDomiciliarioMessages,
    createDomiciliario,
  } = useAdminStore();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ nombre?: string; email?: string }>({});

  const validateForm = () => {
    const newErrors: { nombre?: string; email?: string } = {};

    try {
      createDomiciliarioSchema.parse({ nombre, email });
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: any) => {
          if (err.path[0] === 'nombre') newErrors.nombre = err.message;
          if (err.path[0] === 'email') newErrors.email = err.message;
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    clearDomiciliarioMessages();

    if (!validateForm()) return;

    const success = await createDomiciliario({ nombre, email });

    if (success) {
      setNombre('');
      setEmail('');
      setErrors({});
    }
  };

  useEffect(() => {
    if (!domiciliarioMessage && !domiciliarioError && !lastTemporaryPassword) {
      return;
    }

    const timer = setTimeout(() => {
      clearDomiciliarioMessages();
    }, 15000);

    return () => clearTimeout(timer);
  }, [
    domiciliarioMessage,
    domiciliarioError,
    lastTemporaryPassword,
    clearDomiciliarioMessages,
  ]);

  return (
    <ScrollView
      style={tw`flex-1 bg-jjBeigeSoft`}
      contentContainerStyle={tw`flex-grow justify-center items-center p-4`}
    >
      <View style={tw`w-full max-w-md bg-neutral-card shadow-lg rounded-xl p-6`}>
        <Text testID="screen-title" style={tw`text-xl font-semibold text-jjBlue mb-2`}>
          Crear domiciliario
        </Text>

        <Text style={tw`text-sm text-neutral-gray mb-6`}>
          Registra un domiciliario. El correo entrega la clave temporal y el enlace de la APK.
        </Text>

        <View style={tw`gap-4`}>
          <View style={tw`gap-1`}>
            <Text style={tw`text-sm font-medium text-jjBlueDark`}>Nombre</Text>
            <TextInput
              testID="nombre-input"
              style={tw`px-3 py-2 rounded-lg border border-neutral-light bg-neutral-card text-neutral-dark`}
              value={nombre}
              onChangeText={(text) => {
                setNombre(text);
                if (errors.nombre) setErrors({ ...errors, nombre: undefined });
              }}
              placeholder="Nombre completo"
              placeholderTextColor={COLORS.neutralGray}
            />
            {errors.nombre && (
              <Text style={tw`text-status-cancelado text-xs mt-1`}>
                {errors.nombre}
              </Text>
            )}
          </View>

          <View style={tw`gap-1`}>
            <Text style={tw`text-sm font-medium text-jjBlueDark`}>
              Correo electrónico
            </Text>
            <TextInput
              testID="email-input"
              style={tw`px-3 py-2 rounded-lg border border-neutral-light bg-neutral-card text-neutral-dark`}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={COLORS.neutralGray}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={tw`text-status-cancelado text-xs mt-1`}>
                {errors.email}
              </Text>
            )}
          </View>

          <TouchableOpacity
            testID="submit-button"
            onPress={handleSubmit}
            disabled={isCreatingDomiciliario}
            style={tw`mt-2 py-3 rounded-lg ${
              isCreatingDomiciliario ? 'bg-neutral-gray' : 'bg-jjBlue'
            }`}
          >
            {isCreatingDomiciliario ? (
              <ActivityIndicator color={COLORS.neutralCard} />
            ) : (
              <Text style={tw`text-neutral-card font-medium text-center`}>
                Crear domiciliario
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {domiciliarioMessage && (
          <Text testID="success-message" style={tw`mt-4 text-status-hecho text-sm text-center`}>
            {domiciliarioMessage}
          </Text>
        )}

        {lastTemporaryPassword && (
          <View
            testID="temporary-password-card"
            style={tw`mt-4 rounded-xl border border-jjBlue/20 bg-jjBlue/10 p-4`}
          >
            <Text style={tw`text-sm font-semibold text-jjBlueDark mb-1`}>
              Clave temporal
            </Text>
            <Text selectable style={tw`text-lg font-bold text-jjBlueDark`}>
              {lastTemporaryPassword}
            </Text>
            <Text style={tw`text-xs text-jjBlueDark/70 mt-2`}>
              Esta misma clave se envía al correo del domiciliario. Puede usarla para iniciar sesión y luego cambiarla desde Perfil.
            </Text>
          </View>
        )}

        {domiciliarioError && (
          <Text testID="error-message" style={tw`mt-4 text-status-cancelado text-sm text-center`}>
            {domiciliarioError}
          </Text>
        )}
      </View>
    </ScrollView>
  );
};
