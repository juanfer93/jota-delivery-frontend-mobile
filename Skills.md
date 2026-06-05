# Skills & Patrones de Código - Frontend Móvil (Jota Delivery)

Este documento contiene los patrones exactos que debes usar al generar código para este proyecto.

## Skill 1: Manejo de Estado Global (Zustand)
Usa este patrón para crear Stores. Separa el estado de las acciones e incluye manejo de carga (loading) y errores. Llama a la API usando la instancia centralizada.

```typescript
import { create } from 'zustand';
import api from '@/core/api/axios.instance';

interface FeatureStore {
  isLoading: boolean;
  error: string | null;
  message: string | null;
  executeAction: (data: PayloadDTO) => Promise<boolean>;
  clearMessages: () => void;
}

export const useFeatureStore = create<FeatureStore>((set) => ({
  isLoading: false,
  error: null,
  message: null,

  clearMessages: () => set({ error: null, message: null }),

  executeAction: async (data) => {
    set({ isLoading: true, error: null, message: null });
    try {
      await api.post('/endpoint', data);
      set({ message: 'Acción exitosa' });
      return true;
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Error inesperado';
      set({ error: msg });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));

Skill 2: Componentes de UI, Formularios y Estilos (Tailwind)
Usa siempre tw para clases de Tailwind, incluye testID para testing, y maneja validación con Zod. Recuerda que la autenticación es con correo y contraseña (nunca números de identificación).

import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import tw from '@/lib/tailwind';
// Importar schema de zod y store...

export default function FeatureClient() {
  const { executeAction, isLoading } = useFeatureStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    // 1. Validación Zod (asumiendo schema creado)
    const result = featureSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.issues.forEach(issue => fieldErrors[issue.path[0]] = issue.message);
      setErrors(fieldErrors);
      return;
    }
    
    // 2. Llamada al Store
    await executeAction(result.data);
  };

  return (
    <View style={tw`flex-1 p-6 bg-white`}>
      <Text style={tw`text-sm font-medium text-jj-blueDark mb-2`}>Correo electrónico</Text>
      <TextInput
        testID="feature-email-input"
        style={tw`w-full rounded-xl border border-jj-beige px-4 py-3 text-sm text-jj-blueDark bg-white mb-4`}
        value={form.email}
        onChangeText={(val) => setForm({ ...form, email: val })}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={tw`text-xs text-red-500 mt-1`}>{errors.email}</Text>}

      <TouchableOpacity
        testID="feature-submit-button"
        onPress={handleSubmit}
        disabled={isLoading}
        style={tw`items-center justify-center rounded-2xl bg-jj-blue px-4 py-3.5 shadow-md ${isLoading ? 'opacity-50' : ''}`}
      >
        {isLoading ? <ActivityIndicator color="#F5E9C8" /> : <Text style={tw`text-sm text-jj-beige`}>Confirmar</Text>}
      </TouchableOpacity>
    </View>
  );
}

Skill 3: Testing E2E (Jest + React Testing Library)
Las pruebas deben falsear el router y el storage local, usar testID y esperar navegaciones o renderizados manuales tras cada acción. NO uses .cleanup() manual.

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import FeatureClient from '@/features/feature/presentation/FeatureClient';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

describe('Flujo Feature', () => {
  afterEach(() => {
    mockReplace.mockClear();
    jest.clearAllMocks();
  });

  test('Debe llenar formulario y navegar', async () => {
    render(<FeatureClient />);
    
    fireEvent.changeText(screen.getByTestId('feature-email-input'), 'test@correo.com');
    fireEvent.press(screen.getByTestId('feature-submit-button'));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/siguiente-pantalla');
    }, { timeout: 5000 });
  });
});