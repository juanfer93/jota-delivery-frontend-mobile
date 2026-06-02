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

// ✅ Mock correcto: mockear la instancia de axios del proyecto
const mockApiPost = jest.fn();
const mockApiGet = jest.fn();

jest.mock('@/core/api/axios.instance', () => ({
  __esModule: true,
  default: {
    post: mockApiPost,
    get: mockApiGet,
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
  apiRequest: jest.fn(),
  apiListRequest: jest.fn(),
}));

describe('E2E SIMULADO: Flujo completo de creación de domiciliario', () => {
  
  beforeAll(async () => {
    await TokenStorage.removeToken();
  });

  afterEach(() => {
    mockToken = null;
    mockReplace.mockClear();
    mockPush.mockClear();
    mockApiPost.mockClear();
    mockApiGet.mockClear();
    jest.clearAllMocks();
  });

  test('Admin crea domiciliario → Domiciliario recibe email → Crea contraseña → Login', async () => {
    
    console.log('📝 PASO 1: Admin creando domiciliario...');
    
    // Mock de respuesta exitosa del backend
    mockApiPost.mockResolvedValueOnce({
      data: { 
        data: { 
          id: 'domiciliario-123', 
          nombre: 'Juan Pérez', 
          email: 'domiciliario@test.com', 
          rol: 'DOMICILIARIO' 
        } 
      },
    });

    render(<CreateDeliveryScreen />);
    
    await screen.findByTestId('screen-title');

    const nombreInput = screen.getByTestId('nombre-input');
    const emailInput = screen.getByTestId('email-input');
    
    fireEvent.changeText(nombreInput, 'Juan Pérez');
    fireEvent.changeText(emailInput, 'domiciliario@test.com');

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.press(submitButton);

    // Verificar que se llamó a la API con la instancia correcta
    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/usuarios/domiciliarios',
        { nombre: 'Juan Pérez', email: 'domiciliario@test.com' }
      );
    }, { timeout: 5000 });

    await screen.findByTestId('success-message');
    console.log('✅ Domiciliario creado exitosamente');

    console.log('📧 PASO 2: Simulando email recibido con token...');
    console.log('🔐 PASO 3: Domiciliario creando contraseña...');
    
    // Mock de respuesta exitosa del backend para set password
    mockApiPost.mockResolvedValueOnce({
      data: { 
        data: { 
          message: 'Contraseña creada correctamente. Ya puedes iniciar sesión.' 
        } 
      },
    });

    render(<SetPasswordScreen />);
    
    await screen.findByTestId('screen-title');

    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    
    fireEvent.changeText(passwordInput, 'nuevaPassword123');
    fireEvent.changeText(confirmPasswordInput, 'nuevaPassword123');

    const setPasswordButton = screen.getByTestId('submit-button');
    fireEvent.press(setPasswordButton);

    // Verificar que se llamó a la API con el token
    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/auth/domiciliarios/set-password',
        { token: 'mock-token-12345', password: 'nuevaPassword123' }
      );
    }, { timeout: 5000 });

    await screen.findByTestId('success-message');

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    }, { timeout: 5000 });

    console.log('✅ Contraseña creada exitosamente');
    console.log('✅ Redirección a /login confirmada');
    console.log('🎉 Test E2E completado exitosamente');
  });
});