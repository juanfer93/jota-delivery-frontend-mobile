import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, Image, SafeAreaView
} from 'react-native';
import tw from '@/lib/tailwind';
import { useAuthStore } from '@/features/auth/application/auth.store';
import { useRouter } from 'expo-router';

export default function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const router = useRouter();

  const handleLogin = async () => {
    setServerError(null);
    if (!email || !password) {
      setServerError('Por favor ingresa tu correo y contraseña');
      return;
    }

    try {
      await login({ email, password });
      const user = useAuthStore.getState().user;
      const rol = (user?.rol || '').toLowerCase();

      rol === 'domiciliario'
        ? router.replace('/(app)/delivery' as any)
        : router.replace('/(app)/' as any);
    } catch (error: any) {
      setServerError(error?.response?.data?.message || 'Credenciales inválidas.');
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-jj-beigeSoft`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <View style={tw`flex-1 px-6 py-12 justify-center max-w-[800px] w-full self-center`}>

          <View style={tw`flex-row items-center justify-between rounded-3xl border border-jj-beige/30 bg-jj-blueDark p-6 shadow-lg mb-10`}>
            <View style={tw`flex-row items-center`}>
              <View
                testID="login-logo"
                style={[tw`h-24 w-24 items-center justify-center rounded-2xl overflow-hidden mr-4`, { backgroundColor: '#174A8B' }]}
              >
                <Image
                  source={require('../../../../assets/images/jota-delivery-logo-blue.png')}
                  resizeMode="contain"
                  style={{ width: 96, height: 96 }}
                />
              </View>
              <View>
                <Text style={tw`text-xs uppercase tracking-widest text-jj-beige/80`}>Jota Jota Delivery</Text>
                <Text style={tw`text-2xl font-semibold text-jj-beige`}>Iniciar sesión</Text>
              </View>
            </View>
          </View>

          <View style={tw`rounded-3xl border border-jj-blueDark/10 bg-white/80 p-6 shadow-sm`}>
            <View style={tw`mb-6`}>
              <Text style={tw`text-sm font-medium text-jj-blueDark mb-2`}>Correo</Text>
              <TextInput
                testID="email-input"
                style={tw`w-full rounded-xl border border-jj-beige px-4 py-3 text-sm text-jj-blueDark bg-white`}
                placeholder="Ingresa tu correo"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <View style={tw`mb-6`}>
              <Text style={tw`text-sm font-medium text-jj-blueDark mb-2`}>Contraseña</Text>
              <TextInput
                testID="password-input"
                style={tw`w-full rounded-xl border border-jj-beige px-4 py-3 text-sm text-jj-blueDark bg-white`}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {serverError && (
              <View testID="server-error" style={tw`bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6`}>
                <Text style={tw`text-xs text-red-600`}>{serverError}</Text>
              </View>
            )}

            <TouchableOpacity
              testID="login-button"
              onPress={handleLogin}
              disabled={isLoading}
              style={tw`items-center justify-center rounded-2xl bg-jj-blue px-4 py-3.5 shadow-md ${isLoading ? 'opacity-50' : ''}`}
            >
              {isLoading ? <ActivityIndicator color="#F5E9C8" /> :
                <Text style={tw`text-sm font-medium text-jj-beige`}>Ingresar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
