import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import RootLayout from '@/app/_layout';
import { useAuthStore } from '@/features/auth/application/auth.store';

// 1. MOCK DE SAFE-AREA
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }: any) => React.createElement('View', null, children),
    SafeAreaView: ({ children }: any) => React.createElement('View', null, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// 2. MOCK DEL STORE DE ADMIN
jest.mock('@/features/admin/application/admin.store', () => ({
  useAdminStore: jest.fn().mockReturnValue({
    createFirstAdmin: jest.fn().mockResolvedValue(undefined),
    isCreating: false,
  }),
}));

// 3. ERROR BOUNDARY PARA DEPURACIÓN
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any) { console.error("Render Error:", error); }
  render() { 
    if (this.state.hasError) return <></>; 
    return this.props.children; 
  }
}

// 4. MOCK DE EXPO ROUTER
let mockCurrentPath = '/create-admin';
let mockRouteListeners: ((path: string) => void)[] = [];

jest.mock('expo-router', () => ({
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
      return () => { mockRouteListeners = mockRouteListeners.filter((l: any) => l !== listener); };
    }, []);

    // RUTAS CORREGIDAS SEGÚN TU ESTRUCTURA DE CARPETAS
    const CreateAdminPage = require('@/app/create-admin/page').default;
    const LoginPage = require('@/app/login/page').default;
    const DashboardPage = require('@/app/(app)/index').default;

    return (
      <ErrorBoundary>
        {path === '/login' && <LoginPage />}
        {path === '/(app)/' && <DashboardPage />}
        {path !== '/login' && path !== '/(app)/' && <CreateAdminPage />}
      </ErrorBoundary>
    );
  },
}));

describe('E2E Integration: Admin Bootstrap & Workflow', () => {
  beforeEach(() => {
    useAuthStore.setState({ hasAdmin: null, isAuthenticated: false, isInitializing: false });
    mockCurrentPath = '/create-admin';
    mockRouteListeners = [];
    jest.clearAllMocks();
  });

  afterAll(() => { jest.useRealTimers(); });

  test('Debe ejecutar el flujo completo: Crear Admin -> Login -> Dashboard', async () => {
    render(<RootLayout />);

    // --- PASO 1: CREAR ADMIN ---
    // Usamos await findByText con un timeout generoso
    await screen.findByText('Crear administrador inicial', { exact: false }, { timeout: 10000 });

    fireEvent.changeText(screen.getByTestId('admin-nombre-input'), 'Admin Prueba');
    fireEvent.changeText(screen.getByTestId('admin-email-input'), 'admin@jota.com');
    fireEvent.changeText(screen.getByTestId('admin-password-input'), '12345678');
    fireEvent.changeText(screen.getByTestId('admin-confirmPassword-input'), '12345678');

    await act(async () => {
      fireEvent.press(screen.getByTestId('create-admin-button'));
    });

    // --- PASO 2: LOGIN ---
    // Esperamos a que la pantalla de Login aparezca
    await screen.findByText('Iniciar sesión', { exact: false }, { timeout: 10000 });
    
    fireEvent.changeText(screen.getByTestId('email-input'), 'admin@jota.com');
    fireEvent.changeText(screen.getByTestId('password-input'), '12345678');

    await act(async () => {
      fireEvent.press(screen.getByTestId('login-button'));
    });

    // --- PASO 3: DASHBOARD ---
    const btnCrear = await screen.findByTestId('btn-nav-crear-domiciliario', {}, { timeout: 15000 });
    expect(btnCrear).toBeTruthy();
  }, 60000);
});