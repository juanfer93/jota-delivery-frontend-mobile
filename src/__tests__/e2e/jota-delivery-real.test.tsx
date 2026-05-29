import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import CreateAdminClient from '@/features/admin/presentation/CreateAdminClient';
import LoginClient from '@/features/auth/presentation/LoginClient';
import Dashboard from '@/features/dashboard/presentation/Dashboard';
import { TokenStorage } from '@/core/storage/token.storage';

jest.setTimeout(90000);

// ─────────────────────────────────────────────
// MOCKS: Spy reutilizable para router.replace
// ─────────────────────────────────────────────

// 1. Crear el spy UNA VEZ para poder assertear después
const mockReplace = jest.fn();

// 2. Mock de expo-router: reusar el mismo spy
jest.mock('expo-router', () => {
  const actual = jest.requireActual('expo-router');
  return {
    ...actual,
    useRouter: () => ({ replace: mockReplace, back: jest.fn(), push: jest.fn() }),
    router: { replace: mockReplace, back: jest.fn(), push: jest.fn() },
  };
});

// 3. Mock de TokenStorage: persistencia en memoria para tests
let mockToken: string | null = null;
jest.mock('@/core/storage/token.storage', () => ({
  TokenStorage: {
    setToken: async (token: string) => { mockToken = token; },
    getToken: async () => mockToken,
    removeToken: async () => { mockToken = null; },
  },
}));

// 4. Mock de safe-area (sin cambios)
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

  afterEach(() => {
    cleanup();
    mockToken = null;
    mockReplace.mockClear(); // ← Limpiar spy entre tests
    jest.clearAllMocks();
  });

  test('Debe crear admin, loguear y entrar al dashboard', async () => {
    // ─────────────────────────────────────────────
    // PASO 1: Crear Admin (SIN CAMBIOS - ya funciona)
    // ─────────────────────────────────────────────
    render(<CreateAdminClient />);
    await screen.findByText('Crear administrador inicial', {}, { timeout: 20000 });
    
    fireEvent.changeText(screen.getByTestId('admin-nombre-input'), 'Admin Real Test');
    fireEvent.changeText(screen.getByTestId('admin-email-input'), 'real-test@jota.com');
    fireEvent.changeText(screen.getByTestId('admin-password-input'), '12345678');
    fireEvent.changeText(screen.getByTestId('admin-confirmPassword-input'), '12345678');
    
    fireEvent.press(screen.getByTestId('create-admin-button'));

    // 🔧 FIX: En lugar de buscar texto en UI, verificar que el mock de navegación fue llamado
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    }, { timeout: 20000 });
    
    console.log("✅ Navegación a /login confirmada por mock");

    // ─────────────────────────────────────────────
    // PASO 2: Login (render manual tras "navegación")
    // ─────────────────────────────────────────────
    cleanup();
    render(<LoginClient />);
    
    fireEvent.changeText(screen.getByTestId('email-input'), 'real-test@jota.com');
    
    // 🔧 FIX CLAVE: changeText para inputs de texto, no press
    fireEvent.changeText(screen.getByTestId('password-input'), '12345678');
    
    fireEvent.press(screen.getByTestId('login-button'));
    
    // Esperar que se intente navegar al dashboard principal
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(app)/');
    }, { timeout: 20000 });
    
    console.log("✅ Navegación a /(app)/ confirmada por mock");

    // ─────────────────────────────────────────────
    // PASO 3: Dashboard
    // ─────────────────────────────────────────────
    cleanup();
    render(<Dashboard />);
    
    const btnCrear = await screen.findByTestId('btn-nav-crear-domiciliario', {}, { timeout: 20000 });
    expect(btnCrear).toBeTruthy();
    
    console.log("🎉 Test finalizado con éxito: Dashboard alcanzado");
  }); 
});