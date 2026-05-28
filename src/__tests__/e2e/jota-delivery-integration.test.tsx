import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import RootLayout from '@/app/_layout';
import { useAuthStore } from '@/features/auth/application/auth.store';

// =====================================================================
// 1. MOCK DE SAFE-AREA (Evita errores de renderizado y advertencias)
// =====================================================================
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }: any) => React.createElement('View', null, children),
    SafeAreaView: ({ children }: any) => React.createElement('View', null, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// =====================================================================
// 2. MOCK DE EXPO ROUTER (Variables con prefijo 'mock')
// =====================================================================
let mockCurrentPath = '/';
let mockRouteListeners: ((path: string) => void)[] = [];

jest.mock('expo-router', () => {
  return {
    useRouter: () => ({
      replace: jest.fn((path: string) => {
        mockCurrentPath = path;
        mockRouteListeners.forEach((listener) => listener(path));
      }),
      push: jest.fn(),
    }),
    Slot: () => {
      const React = require('react');
      const [path, setPath] = React.useState(mockCurrentPath);

      React.useEffect(() => {
        const listener = (newPath: string) => setPath(newPath);
        mockRouteListeners.push(listener);
        return () => {
          mockRouteListeners = mockRouteListeners.filter((l: any) => l !== listener);
        };
      }, []);

      if (path === '/create-admin') {
        const CreateAdminPage = require('@/app/create-admin').default;
        return <CreateAdminPage />;
      }
      if (path === '/login') {
        const LoginPage = require('@/app/login').default;
        return <LoginPage />;
      }
      if (path === '/(app)/') {
        const DashboardPage = require('@/app/(app)/index').default;
        return <DashboardPage />;
      }

      const { View } = require('react-native');
      return <View testID="empty-slot" />;
    },
  };
});

// =====================================================================
// 3. EL TEST END-TO-END UNIFICADO
// =====================================================================
describe('E2E Integration: Admin Bootstrap & Workflow', () => {
  beforeEach(() => {
    // Resetear estado
    useAuthStore.setState({ hasAdmin: null, isAuthenticated: false, isInitializing: true });
    mockCurrentPath = '/';
    mockRouteListeners = [];
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Limpia cualquier timer o proceso pendiente para evitar advertencias de "did not exit"
    jest.useRealTimers();
  });

  test('Debe ejecutar el flujo completo: Crear Admin -> Login -> Dashboard', async () => {
    // --- PASO 1: ARRANQUE ---
    render(<RootLayout />);

    const adminTitle = await screen.findByText(/Crear administrador inicial/i, {}, { timeout: 10000 });
    expect(adminTitle).toBeTruthy();

    // --- PASO 2: CREACIÓN DE ADMIN ---
    fireEvent.changeText(screen.getByTestId('admin-nombre-input'), 'Admin Prueba');
    fireEvent.changeText(screen.getByTestId('admin-email-input'), 'admin@jota.com');
    fireEvent.changeText(screen.getByTestId('admin-password-input'), '12345678');
    fireEvent.changeText(screen.getByTestId('admin-confirmPassword-input'), '12345678');
    
    fireEvent.press(screen.getByTestId('create-admin-button'));

    // --- PASO 3: REDIRECCIÓN A LOGIN ---
    const loginTitle = await screen.findByText(/Iniciar sesión/i, {}, { timeout: 10000 });
    expect(loginTitle).toBeTruthy();

    // --- PASO 4: LOGIN Y DASHBOARD ---
    fireEvent.changeText(screen.getByTestId('email-input'), 'admin@jota.com');
    fireEvent.changeText(screen.getByTestId('password-input'), '12345678');
    fireEvent.press(screen.getByTestId('login-button')); 
    
    // Verificamos que llegamos al dashboard
    const btnCrear = await screen.findByTestId('btn-nav-crear-domiciliario', {}, { timeout: 10000 });
    expect(btnCrear).toBeTruthy();
  }, 60000); // 60 segundos de timeout
});