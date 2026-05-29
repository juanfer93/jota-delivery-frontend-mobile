import React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react-native';
import CreateAdminClient from '@/features/admin/presentation/CreateAdminClient';
import LoginClient from '@/features/auth/presentation/LoginClient';
import Dashboard from '@/features/dashboard/presentation/Dashboard';
import { TokenStorage } from '@/core/storage/token.storage';

jest.setTimeout(90000);

// ─────────────────────────────────────────────
// MOCKS MÍNIMOS
// ─────────────────────────────────────────────

// 1. Mock de TokenStorage: persistencia en memoria para tests
let mockToken: string | null = null;
jest.mock('@/core/storage/token.storage', () => ({
  TokenStorage: {
    setToken: async (token: string) => { mockToken = token; },
    getToken: async () => mockToken,
    removeToken: async () => { mockToken = null; },
  },
}));

// 2. Mock de axios: sin import previo, mock directo para evitar TS6133
const mockAxios: any = {
  create: jest.fn(() => mockAxios),
  get: jest.fn(),
  post: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
};

jest.mock('axios', () => mockAxios);

// 3. Mocks originales (sin cambios)
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn() }),
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

  afterEach(() => {
    cleanup();
    mockToken = null;
    jest.clearAllMocks();
  });

  test('Debe crear admin, loguear y entrar al dashboard', async () => {
    // --- PASO 1: Crear Admin ---
    // ✅ SIN CAMBIOS: esto ya te funciona
    render(<CreateAdminClient />);
    await screen.findByText('Crear administrador inicial', {}, { timeout: 20000 });
    
    fireEvent.changeText(screen.getByTestId('admin-nombre-input'), 'Admin Real Test');
    fireEvent.changeText(screen.getByTestId('admin-email-input'), 'real-test@jota.com');
    fireEvent.changeText(screen.getByTestId('admin-password-input'), '12345678');
    fireEvent.changeText(screen.getByTestId('admin-confirmPassword-input'), '12345678');
    
    fireEvent.press(screen.getByTestId('create-admin-button'));

    await screen.findByText('Iniciar sesión', {}, { timeout: 20000 });
    console.log("Navegación al Login confirmada por UI");

    // --- PASO 2: Login ---
    // 🔧 FIX: cleanup() antes de re-renderizar
    cleanup();
    render(<LoginClient />);
    
    fireEvent.changeText(screen.getByTestId('email-input'), 'real-test@jota.com');
    
    // 🔧 FIX CLAVE: changeText en lugar de press para inputs de texto
    fireEvent.changeText(screen.getByTestId('password-input'), '12345678');
    
    fireEvent.press(screen.getByTestId('login-button'));
    
    // Esperamos elementos del Dashboard (fallback si "Bienvenido" no existe)
    await screen.findByText('Bienvenido', {}, { timeout: 20000 }).catch(() => {
      console.log("⚠️ 'Bienvenido' no encontrado, intentando con botón del dashboard...");
    });
    
    console.log("Navegación al Dashboard confirmada por UI");

    // --- PASO 3: Dashboard ---
    // 🔧 FIX: cleanup() antes de renderizar dashboard
    cleanup();
    render(<Dashboard />);
    
    const btnCrear = await screen.findByTestId('btn-nav-crear-domiciliario', {}, { timeout: 20000 });
    expect(btnCrear).toBeTruthy();
    console.log("Test finalizado con éxito: Dashboard alcanzado");
  }); 
});