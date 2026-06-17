import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import tw from '@/lib/tailwind';
import { useAuthStore } from '@/features/auth/application/auth.store';
import { setPasswordSchema } from '@/features/auth/domain/auth.schemas';

const COLORS = {
  neutralGray: '#6b7280',
  neutralCard: '#ffffff',
};

type SetPasswordScreenProps = {
  mode?: 'token' | 'profile';
};

export const SetPasswordScreen = ({ mode = 'token' }: SetPasswordScreenProps) => {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  const {
    isSettingPassword,
    setPasswordMessage,
    setPasswordError,
    clearPasswordMessages,
    setPassword,
    changeProfilePassword,
  } = useAuthStore();

  const [password, setPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const isProfileMode = mode === 'profile';

  useEffect(() => {
    clearPasswordMessages();
  }, [clearPasswordMessages]);

  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    try {
      setPasswordSchema.parse({ password, confirmPassword });
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: any) => {
          if (err.path[0] === 'password') newErrors.password = err.message;
          if (err.path[0] === 'confirmPassword') {
            newErrors.confirmPassword = err.message;
          }
        });
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!isProfileMode && !token) return;

    clearPasswordMessages();

    if (!validateForm()) return;

    const success = isProfileMode
      ? await changeProfilePassword({
        password,
        confirmPassword,
      })
      : await setPassword({
        token,
        password,
      });

    if (success) {
      setPasswordValue('');
      setConfirmPassword('');
      setErrors({});

      if (isProfileMode) {
        router.replace('/(app)/profile' as any);
      } else {
        router.push('/login');
      }
    }
  };

  if (!isProfileMode && !token) {
    return (
      <ScrollView
        style={tw`flex-1 bg-jjBeigeSoft`}
        contentContainerStyle={tw`flex-grow justify-center items-center p-4`}
      >
        <View
          style={tw`w-full max-w-md bg-neutral-card rounded-xl shadow-lg border border-jjBeige p-6`}
        >
          <Text style={tw`text-xl font-semibold text-neutral-dark mb-2`}>
            Crear contraseña
          </Text>
          <Text style={tw`text-sm text-status-cancelado`}>
            Token no válido. Abre el enlace directamente desde tu correo.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={tw`flex-1 bg-jjBeigeSoft`}
      contentContainerStyle={tw`flex-grow justify-center items-center p-4`}
    >
      <View style={tw`w-full max-w-md bg-neutral-card rounded-xl shadow-lg p-6`}>
        <Text testID="screen-title" style={tw`text-xl font-semibold text-neutral-dark mb-2`}>
          {isProfileMode ? 'Cambiar contraseña' : 'Crear contraseña'}
        </Text>

        <Text style={tw`text-sm text-neutral-gray mb-6`}>
          {isProfileMode
            ? 'Define una nueva contraseña para tu cuenta.'
            : 'Define tu nueva contraseña para poder iniciar sesión como domiciliario.'}
        </Text>

        <View style={tw`gap-4`}>
          <View style={tw`gap-1`}>
            <Text style={tw`text-sm font-medium text-jjBlueDark`}>
              Nueva contraseña
            </Text>
            <TextInput
              testID="password-input"
              style={tw`px-3 py-2 rounded-lg border border-neutral-light bg-neutral-card text-neutral-dark`}
              value={password}
              onChangeText={(text) => {
                setPasswordValue(text);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              placeholder="••••••"
              placeholderTextColor={COLORS.neutralGray}
              secureTextEntry
            />
            {errors.password && (
              <Text style={tw`text-status-cancelado text-xs mt-1`}>
                {errors.password}
              </Text>
            )}
          </View>

          <View style={tw`gap-1`}>
            <Text style={tw`text-sm font-medium text-jjBlueDark`}>
              Confirmar contraseña
            </Text>
            <TextInput
              testID="confirm-password-input"
              style={tw`px-3 py-2 rounded-lg border border-neutral-light bg-neutral-card text-neutral-dark`}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: undefined });
                }
              }}
              placeholder="••••••"
              placeholderTextColor={COLORS.neutralGray}
              secureTextEntry
            />
            {errors.confirmPassword && (
              <Text style={tw`text-status-cancelado text-xs mt-1`}>
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          <TouchableOpacity
            testID="submit-button"
            onPress={handleSubmit}
            disabled={isSettingPassword}
            style={tw`mt-2 py-3 rounded-lg ${isSettingPassword ? 'bg-neutral-gray' : 'bg-jjBlue'
              }`}
          >
            {isSettingPassword ? (
              <ActivityIndicator color={COLORS.neutralCard} />
            ) : (
              <Text style={tw`text-neutral-card font-medium text-center`}>
                Guardar contraseña
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {setPasswordMessage && (
          <Text testID="success-message" style={tw`mt-4 text-status-hecho text-sm text-center`}>
            {setPasswordMessage}
          </Text>
        )}

        {setPasswordError && (
          <Text testID="error-message" style={tw`mt-4 text-status-cancelado text-sm text-center`}>
            {setPasswordError}
          </Text>
        )}
      </View>
    </ScrollView>
  );
};