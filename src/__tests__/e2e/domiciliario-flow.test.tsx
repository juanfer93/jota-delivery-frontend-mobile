import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { CreateDeliveryScreen } from '@/features/admin/presentation/CreateDeliveryScreen';
import { SetPasswordScreen } from '@/features/auth/presentation/SetPasswordScreen';

jest.setTimeout(30000);

// ─────────────────────────────────────────────
// MOCKS
// ─────────────────────────────────────────────

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => {
  const actual = jest.requireActual('expo-router');
  return {
    ...actual,
    useRouter: () => ({ 
      replace: mockReplace, 
      back: jest.fn(), 
      push: mockPush 
    }),
    useLocalSearchParams: () => ({ token: 'mock-token-12345' }),
    router: { 
      replace: mockReplace, 
      back: jest.fn(), 
      push: mockPush 
    },
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }: any) => React.createElement('View', null, children),
    SafeAreaView: ({ children }: any) => React.createElement('View', null, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// ✅ NUEVA ESTRATEGIA: Mockear los stores directamente
const mockCreateDomiciliario = jest.fn();
const mockClearDomiciliarioMessages = jest.fn();

jest.mock('@/features/admin/application/admin.store', () => ({
  useAdminStore: () => ({
    isCreatingDomiciliario: false,
    domiciliarioMessage: null,
    domiciliarioError: null,
    clearDomiciliarioMessages: mockClearDomiciliarioMessages,
    createDomiciliario: mockCreateDomiciliario,
  }),
}));

const mockSetPassword = jest.fn();
const mockClearPasswordMessages = jest.fn();

jest.mock('@/features/auth/application/auth.store', () => ({
  useAuthStore: () => ({
    isSettingPassword: false,
    setPasswordMessage: null,
    setPasswordError: null,
    clearPasswordMessages: mockClearPasswordMessages,
    setPassword: mockSetPassword,
  }),
}));

describe('E2E SIMULADO: Flujo completo de creación de domiciliario', () => {
  
  beforeEach(() => {
    mockCreateDomiciliario.mockClear();
    mockClearDomiciliarioMessages.mockClear();
    mockSetPassword.mockClear();
    mockClearPasswordMessages.mockClear();
    mockReplace.mockClear();
    mockPush.mockClear();
  });

  test('Admin crea domiciliario → Domiciliario recibe email → Crea contraseña → Login', async () => {
    
    // ─────────────────────────────────────────────
    // PASO 1: Admin crea domiciliario
    // ─────────────────────────────────────────────
    console.log('📝 PASO 1: Admin creando domiciliario...');
    
    // Configurar mock para que retorne éxito
    mockCreateDomiciliario.mockResolvedValueOnce(true);

    render(<CreateDeliveryScreen />);
    
    await screen.findByTestId('screen-title');

    const nombreInput = screen.getByTestId('nombre-input');
    const emailInput = screen.getByTestId('email-input');
    
    fireEvent.changeText(nombreInput, 'Juan Pérez');
    fireEvent.changeText(emailInput, 'domiciliario@test.com');

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.press(submitButton);

    // Verificar que se llamó a la función del store
    await waitFor(() => {
      expect(mockCreateDomiciliario).toHaveBeenCalledWith({
        nombre: 'Juan Pérez',
        email: 'domiciliario@test.com',
      });
    }, { timeout: 5000 });

    console.log('✅ Admin llamó a createDomiciliario correctamente');

    // ─────────────────────────────────────────────
    // PASO 2: Simular que el domiciliario recibe el email
    // ─────────────────────────────────────────────
    console.log('📧 PASO 2: Simulando email recibido con token...');
    console.log('🔗 Token recibido: mock-token-12345');

    // ─────────────────────────────────────────────
    // PASO 3: Domiciliario abre link y crea contraseña
    // ─────────────────────────────────────────────
    console.log('🔐 PASO 3: Domiciliario creando contraseña...');
    
    // Configurar mock para que retorne éxito
    mockSetPassword.mockResolvedValueOnce(true);

    render(<SetPasswordScreen />);
    
    await screen.findByTestId('screen-title');

    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    
    fireEvent.changeText(passwordInput, 'nuevaPassword123');
    fireEvent.changeText(confirmPasswordInput, 'nuevaPassword123');

    const setPasswordButton = screen.getByTestId('submit-button');
    fireEvent.press(setPasswordButton);

    // Verificar que se llamó a la función del store con el token
    await waitFor(() => {
      expect(mockSetPassword).toHaveBeenCalledWith({
        token: 'mock-token-12345',
        password: 'nuevaPassword123',
      });
    }, { timeout: 5000 });

    // Verificar redirección al login
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    }, { timeout: 5000 });

    console.log('✅ Domiciliario llamó a setPassword correctamente');
    console.log('✅ Redirección a /login confirmada');

    console.log('🎉 Test E2E completado exitosamente:');
    console.log('   1. ✅ Admin creó domiciliario');
    console.log('   2. ✅ Email simulado con token');
    console.log('   3. ✅ Domiciliario creó contraseña');
    console.log('   4. ✅ Redirigido a login');
  });
});