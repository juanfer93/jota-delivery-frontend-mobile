import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { CreateDeliveryScreen } from '@/features/admin/presentation/CreateDeliveryScreen';
import { SetPasswordScreen } from '@/features/auth/presentation/SetPasswordScreen';
import { TokenStorage } from '@/core/storage/token.storage';

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

let mockToken: string | null = null;
jest.mock('@/core/storage/token.storage', () => ({
  TokenStorage: {
    setToken: async (token: string) => { mockToken = token; },
    getToken: async () => mockToken,
    removeToken: async () => { mockToken = null; },
  },
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }: any) => React.createElement('View', null, children),
    SafeAreaView: ({ children }: any) => React.createElement('View', null, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Mock de axios para simular respuestas del backend
const mockAxiosPost = jest.fn();
jest.mock('axios', () => ({
  create: () => ({
    post: mockAxiosPost,
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  }),
}));

describe('E2E SIMULADO: Flujo completo de creación de domiciliario', () => {
  
  beforeAll(async () => {
    await TokenStorage.removeToken();
  });

  afterEach(() => {
    mockToken = null;
    mockReplace.mockClear();
    mockPush.mockClear();
    mockAxiosPost.mockClear();
    jest.clearAllMocks();
  });

  test('Admin crea domiciliario → Domiciliario recibe email → Crea contraseña → Login', async () => {
    
    // ─────────────────────────────────────────────
    // PASO 1: Admin crea domiciliario
    // ─────────────────────────────────────────────
    console.log('📝 PASO 1: Admin creando domiciliario...');
    
    // Mock de respuesta exitosa del backend
    mockAxiosPost.mockResolvedValueOnce({
      data: {
        data: {
          id: 'domiciliario-123',
          nombre: 'Juan Pérez',
          email: 'domiciliario@test.com',
          rol: 'DOMICILIARIO',
        },
      },
    });

    render(<CreateDeliveryScreen />);
    
    // Usar getByText con exactitud o findByRole si es posible, pero aquí usaremos un selector más específico
    // Buscamos el título principal
    const title = await screen.findByText('Crear domiciliario', { exact: true });
    expect(title).toBeTruthy();

    // Llenar formulario usando placeholders (son únicos)
    const nombreInput = screen.getByPlaceholderText('Nombre completo');
    const emailInput = screen.getByPlaceholderText('correo@ejemplo.com');
    
    fireEvent.changeText(nombreInput, 'Juan Pérez');
    fireEvent.changeText(emailInput, 'domiciliario@test.com');

    // Enviar formulario buscando por el texto del botón dentro de un TouchableOpacity
    // Como hay dos textos iguales, buscamos el que está dentro de un componente presionable o usamos getAllByText
    const buttons = screen.getAllByText('Crear domiciliario');
    // El segundo elemento suele ser el botón en esta estructura
    const submitButton = buttons[1]; 
    fireEvent.press(submitButton);

    // Verificar que se llamó a la API
    await waitFor(() => {
      expect(mockAxiosPost).toHaveBeenCalledWith(
        '/usuarios/domiciliarios',
        { nombre: 'Juan Pérez', email: 'domiciliario@test.com' }
      );
    }, { timeout: 5000 });

    // Verificar mensaje de éxito
    await screen.findByText('Domiciliario creado. Se ha enviado un correo de confirmación.', {}, { timeout: 5000 });
    
    console.log('✅ Domiciliario creado exitosamente');

    // ─────────────────────────────────────────────
    // PASO 2: Simular que el domiciliario recibe el email
    // ─────────────────────────────────────────────
    console.log('📧 PASO 2: Simulando email recibido con token...');
    
    const token = 'mock-token-12345';
    console.log(`🔗 Token recibido: ${token}`);

    // ─────────────────────────────────────────────
    // PASO 3: Domiciliario abre link y crea contraseña
    // ─────────────────────────────────────────────
    console.log('🔐 PASO 3: Domiciliario creando contraseña...');
    
    // Mock de respuesta exitosa del backend
    mockAxiosPost.mockResolvedValueOnce({
      data: {
        data: {
          message: 'Contraseña creada correctamente. Ya puedes iniciar sesión.',
        },
      },
    });

    render(<SetPasswordScreen />);
    
    await screen.findByText('Crear contraseña', { exact: true });

    // Llenar formulario de contraseña
    // Hay dos inputs con el mismo placeholder, los seleccionamos por índice
    const passwordInputs = screen.getAllByPlaceholderText('••••••');
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    
    fireEvent.changeText(passwordInput, 'nuevaPassword123');
    fireEvent.changeText(confirmPasswordInput, 'nuevaPassword123');

    // Enviar formulario
    const setPasswordButton = screen.getByText('Guardar contraseña');
    fireEvent.press(setPasswordButton);

    // Verificar que se llamó a la API con el token
    await waitFor(() => {
      expect(mockAxiosPost).toHaveBeenCalledWith(
        '/auth/domiciliarios/set-password',
        { token: 'mock-token-12345', password: 'nuevaPassword123' }
      );
    }, { timeout: 5000 });

    // Verificar mensaje de éxito
    await screen.findByText('Contraseña creada correctamente. Ya puedes iniciar sesión.', {}, { timeout: 5000 });

    // Verificar redirección al login
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    }, { timeout: 5000 });

    console.log('✅ Contraseña creada exitosamente');
    console.log('✅ Redirección a /login confirmada');

    console.log('🎉 Test E2E completado exitosamente:');
    console.log('   1. ✅ Admin creó domiciliario');
    console.log('   2. ✅ Email simulado con token');
    console.log('   3. ✅ Domiciliario creó contraseña');
    console.log('   4. ✅ Redirigido a login');
  });
});