import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import RootLayout from '@/app/_layout';
import { useAuthStore } from '@/features/auth/application/auth.store';

// =====================================================================
// 1. MOCK DE EXPO ROUTER (EL MINI-ROUTER)
// =====================================================================
let currentPath = '/';
let routeListeners: ((path: string) => void)[] = [];

const mockReplace = jest.fn((path: string) => {
  currentPath = path;
  routeListeners.forEach((listener) => listener(path));
});

jest.mock('expo-router', () => {
  return {
    useRouter: () => ({
      replace: mockReplace,
      push: jest.fn(),
    }),
    Slot: () => {
      const React = require('react');
      const [path, setPath] = React.useState(currentPath);

      React.useEffect(() => {
        const listener = (newPath: string) => setPath(newPath);
        routeListeners.push(listener);
        return () => {
          routeListeners = routeListeners.filter((l: any) => l !== listener);
        };
      }, []);

      // Simular la navegación renderizando los componentes reales
      if (path === '/create-admin') {
        const CreateAdminPage = require('@/app/create-admin').default;
        return <CreateAdminPage />;
      }
      if (path === '/login') {
        const LoginPage = require('@/app/login').default;
        return <LoginPage />;
      }
      if (path === '/(app)/') {
        // Asegúrate de que esta sea la ruta correcta a tu dashboard en (app)
        const DashboardPage = require('@/app/(app)/index').default;
        return <DashboardPage />;
      }

      const { View } = require('react-native');
      return <View testID="empty-slot" />;
    },
  };
});

// =====================================================================
// 2. EL TEST END-TO-END UNIFICADO
// =====================================================================
describe('E2E Integration: Admin Bootstrap & Workflow', () => {
  beforeEach(() => {
    // Resetear todo al estado de fábrica antes de arrancar
    useAuthStore.setState({ hasAdmin: null, isAuthenticated: false, isInitializing: true });
    currentPath = '/';
    routeListeners = [];
    jest.clearAllMocks();
  });

  // Hacemos TODO en un solo bloque "test" para mantener el árbol de componentes vivo
  test('Debe ejecutar el flujo completo: Crear Admin -> Login -> Dashboard', async () => {
    
    // --- PASO 1: ARRANQUE ---
    render(<RootLayout />);

    // El sistema debe verificar que no hay admin y redirigir automáticamente
    const adminTitle = await screen.findByText(/Crear administrador inicial/i, {}, { timeout: 10000 });
    expect(adminTitle).toBeTruthy();

    // --- PASO 2: CREACIÓN DE ADMIN ---
    fireEvent.changeText(screen.getByTestId('admin-nombre-input'), 'Admin Prueba');
    fireEvent.changeText(screen.getByTestId('admin-email-input'), 'admin@jota.com');
    fireEvent.changeText(screen.getByTestId('admin-password-input'), '12345678');
    fireEvent.changeText(screen.getByTestId('admin-confirmPassword-input'), '12345678');
    
    fireEvent.press(screen.getByTestId('create-admin-button'));

    // --- PASO 3: REDIRECCIÓN A LOGIN ---
    // El sistema debe crear el admin y cambiar la ruta a /login
    const loginTitle = await screen.findByText(/Iniciar sesión/i, {}, { timeout: 10000 });
    expect(loginTitle).toBeTruthy();

    // --- PASO 4: LOGIN Y DASHBOARD ---
    fireEvent.changeText(screen.getByTestId('email-input'), 'admin@jota.com');
    fireEvent.changeText(screen.getByTestId('password-input'), '12345678');
    fireEvent.press(screen.getByTestId('login-button')); // <- Corregido aquí
    
    // Verificamos que llegamos al dashboard buscando un elemento clave
    // Asegúrate de que este ID exista en tu pantalla de inicio tras login
    const btnCrear = await screen.findByTestId('btn-nav-crear-domiciliario', {}, { timeout: 10000 });
    expect(btnCrear).toBeTruthy();
  });
});