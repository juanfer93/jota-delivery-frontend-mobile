import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'; // ← Sin cleanup importado
import CreateAdminClient from '@/features/admin/presentation/CreateAdminClient';
import LoginClient from '@/features/auth/presentation/LoginClient';
import Dashboard from '@/features/dashboard/presentation/Dashboard';
import { TokenStorage } from '@/core/storage/token.storage';

jest.setTimeout(90000);

// ─────────────────────────────────────────────
// MOCKS: Spy reutilizable para router.replace
// ─────────────────────────────────────────────

const mockReplace = jest.fn();

jest.mock('expo-router', () => {
  const actual = jest.requireActual('expo-router');
  return {
    ...actual,
    useRouter: () => ({ replace: mockReplace, back: jest.fn(), push: jest.fn() }),
    router: { replace: mockReplace, back: jest.fn(), push: jest.fn() },
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

describe('E2E REAL: Flujo completo Backend', () => {

  beforeAll(async () => {
    await TokenStorage.removeToken();
  });

  // ✅ cleanup() SOLO aquí, no dentro del test
  afterEach(() => {
    mockToken = null;
    mockReplace.mockClear();
    jest.clearAllMocks();
    // cleanup() lo hace jest-expo automáticamente, pero si lo necesitas:
    // const { cleanup } = require('@testing-library/react-native');
    // cleanup();
  });

  test('Debe crear admin, loguear y entrar al dashboard', async () => {
    // ─────────────────────────────────────────────
    // PASO 1: Crear Admin (SIN CAMBIOS)
    // ─────────────────────────────────────────────
    render(<CreateAdminClient />);
    await screen.findByText('Crear administrador inicial', {}, { timeout: 20000 });

    fireEvent.changeText(screen.getByTestId('admin-nombre-input'), 'Admin Real Test');
    fireEvent.changeText(screen.getByTestId('admin-email-input'), 'real-test@jota.com');
    fireEvent.changeText(screen.getByTestId('admin-password-input'), '12345678');
    fireEvent.changeText(screen.getByTestId('admin-confirmPassword-input'), '12345678');

    fireEvent.press(screen.getByTestId('create-admin-button'));

    // Verificar navegación vía mock
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    }, { timeout: 20000 });

    console.log("✅ Navegación a /login confirmada por mock");

    // ─────────────────────────────────────────────
    // PASO 2: Login (render manual, SIN cleanup intermedio)
    // ─────────────────────────────────────────────
    // 🔧 FIX: NO llamar cleanup() aquí. Cada render() actualiza screen automáticamente.
    render(<LoginClient />);

    fireEvent.changeText(screen.getByTestId('email-input'), 'real-test@jota.com');

    // 🔧 FIX: changeText para inputs de texto
    fireEvent.changeText(screen.getByTestId('password-input'), '12345678');

    fireEvent.press(screen.getByTestId('login-button'));

    // Esperar navegación al dashboard
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(app)/');
    }, { timeout: 20000 });

    console.log("✅ Navegación a /(app)/ confirmada por mock");

    // ─────────────────────────────────────────────
    // PASO 3: Dashboard (render manual, SIN cleanup intermedio)
    // ─────────────────────────────────────────────
    render(<Dashboard />);

    const btnCrear = await screen.findByTestId('btn-nav-crear-domiciliario', {}, { timeout: 20000 });
    expect(btnCrear).toBeTruthy();
    console.log("🔍 Token en mockToken:", mockToken);
    console.log("🔍 Llamadas a router.replace:", mockReplace.mock.calls);

    console.log("🎉 Test finalizado con éxito: Dashboard alcanzado");
  });
});
