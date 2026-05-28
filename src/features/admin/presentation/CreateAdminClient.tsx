import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { useAdminStore } from '@/features/admin/application/admin.store';
import { createAdminSchema, CreateAdminForm } from '@/features/admin/domain/admin.schema';
import { CreateAdminDTO } from '@/features/admin/domain/admin.types';
import { isAxiosError } from 'axios';

export default function CreateAdminClient() {
  const router = useRouter();
  const { createFirstAdmin, isCreating } = useAdminStore();
  const [form, setForm] = useState<CreateAdminForm>(
    {
      nombre: '',
      email: '',
      password: '',
      confirmPassword: '',
      rol: 'admin'
    });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateAdminForm, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setServerError(null);
    const result = createAdminSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: any = {};
      result.error.issues.forEach(issue => fieldErrors[issue.path[0]] = issue.message);
      setErrors(fieldErrors);
      return;
    }

    try {
      const { confirmPassword, ...dtoData } = result.data;
      
      const payload: CreateAdminDTO = {
        ...dtoData,
        rol: 'admin' 
      };

      await createFirstAdmin(payload);
      console.log("Creación exitosa, intentando navegar...");
      console.log("DEBUG ROUTER:", typeof router.replace);
      await new Promise(resolve => setTimeout(resolve, 100));
      router.replace('/login');
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        console.error("ERROR DETECTADO EN API:", err.response?.data);
        setServerError('No se pudo crear el administrador.');
      } else {
        console.error("Error desconocido:", err);
        setServerError('Error inesperado.');
      }
    }
};

  return (
    <SafeAreaView style={tw`flex-1 bg-jj-beigeSoft`}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <ScrollView contentContainerStyle={tw`p-6 py-12`}>

          <View style={tw`rounded-3xl border border-jj-beige/30 bg-jj-blueDark p-6 shadow-lg mb-10`}>
            <Text style={tw`text-xs uppercase tracking-widest text-jj-beige/80`}>Jota Jota Delivery</Text>
            <Text style={tw`text-2xl font-semibold text-jj-beige`}>Crear administrador inicial</Text>
            <Text style={tw`text-sm text-jj-beige/80 mt-2`}>Esta acción solo está disponible mientras no exista un administrador.</Text>
          </View>

          <View style={tw`rounded-3xl border border-jj-blueDark/10 bg-white/80 p-8 shadow-sm`}>
            {[
              { label: 'Nombre completo', key: 'nombre', placeholder: 'Ej. Ana Martínez' },
              { label: 'Correo electrónico', key: 'email', placeholder: 'admin@jotajota.com', keyboard: 'email-address' },
              { label: 'Contraseña', key: 'password', placeholder: 'Mínimo 8 caracteres', secure: true },
              { label: 'Confirmar contraseña', key: 'confirmPassword', placeholder: 'Repite la contraseña', secure: true },
            ].map((field) => (
              <View key={field.key} style={tw`mb-5`}>
                <Text style={tw`text-sm font-medium text-jj-blueDark mb-2`}>{field.label}</Text>
                <TextInput
                  testID={`admin-${field.key}-input`}
                  style={tw`w-full rounded-xl border border-jj-beige px-4 py-3 text-sm text-jj-blueDark bg-white`}
                  placeholder={field.placeholder}
                  value={form[field.key as keyof CreateAdminForm]}
                  onChangeText={(val) => setForm({ ...form, [field.key]: val })}
                  secureTextEntry={field.secure}
                  autoCapitalize="none"
                />
                {errors[field.key as keyof CreateAdminForm] && (
                  <Text style={tw`text-xs text-red-500 mt-1`}>{errors[field.key as keyof CreateAdminForm]}</Text>
                )}
              </View>
            ))}

            {serverError && <Text style={tw`text-red-600 mb-4`}>{serverError}</Text>}

            <TouchableOpacity
              testID="create-admin-button"
              onPress={handleSubmit}
              disabled={isCreating}
              style={tw`items-center justify-center rounded-2xl bg-jj-blue px-4 py-3.5 shadow-md ${isCreating ? 'opacity-50' : ''}`}
            >
              {isCreating ? <ActivityIndicator color="#F5E9C8" /> : <Text style={tw`text-sm font-medium text-jj-beige`}>Crear administrador</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}