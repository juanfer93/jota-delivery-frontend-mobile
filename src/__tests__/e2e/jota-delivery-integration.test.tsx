import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import CreateAdminClient from '@/features/admin/presentation/CreateAdminClient';
import LoginClient from '@/features/auth/presentation/LoginClient';
import Dashboard from '@/features/dashboard/presentation/Dashboard';

// 1. Mock Router
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// 2. Mock Admin Store
jest.mock('@/features/admin/application/admin.store', () => ({
  useAdminStore: jest.fn().mockReturnValue({
    createFirstAdmin: jest.fn().mockResolvedValue(undefined),
    isCreating: false,
  }),
}));

// 3. Mock Delivery Store (IMPORTANTE: Esto evita que el Dashboard intente cargar datos reales)
jest.mock('@/features/delivery/application/delivery.store', () => ({
  useDeliveryStore: jest.fn().mockReturnValue({
    pedidosHoy: [],
    loadData: jest.fn(),
    status: 'idle',
  }),
}));

// 4. Mock Auth Store
const mockLogin = jest.fn().mockResolvedValue(undefined);
jest.mock('@/features/auth/application/auth.store', () => {
  const actual = jest.requireActual('@/features/auth/application/auth.store');
  return {
    ...actual,
    useAuthStore: jest.fn((selector) => selector({
      login: mockLogin,
      isLoading: false,
      user: { rol: 'admin' }
    })),
  };
});
(require('@/features/auth/application/auth.store').useAuthStore as any).getState = jest.fn(() => ({
  user: { rol: 'admin' }
}));

// 5. Mock SafeArea
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }: any) => React.createElement('View', null, children),
    SafeAreaView: ({ children }: any) => React.createElement('View', null, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

describe('E2E Modular: Flujo de Administrador', () => {
  
  test('Flujo completo: Crear Admin -> Login -> Dashboard', async () => {
    
    // --- PASO 1: Crear Admin ---
    render(<CreateAdminClient />);
    await screen.findByText('Crear administrador inicial', { exact: false });
    
    fireEvent.changeText(screen.getByTestId('admin-nombre-input'), 'Admin Prueba');
    fireEvent.changeText(screen.getByTestId('admin-email-input'), 'admin@jota.com');
    fireEvent.changeText(screen.getByTestId('admin-password-input'), '12345678');
    fireEvent.changeText(screen.getByTestId('admin-confirmPassword-input'), '12345678');
    
    await act(async () => {
      fireEvent.press(screen.getByTestId('create-admin-button'));
    });
    
    expect(mockReplace).toHaveBeenCalledWith('/login');

    // --- PASO 2: Login ---
    jest.clearAllMocks();
    render(<LoginClient />);
    
    await screen.findByText('Iniciar sesión', { exact: false });
    fireEvent.changeText(screen.getByTestId('email-input'), 'admin@jota.com');
    fireEvent.changeText(screen.getByTestId('password-input'), '12345678');
    
    await act(async () => {
      fireEvent.press(screen.getByTestId('login-button'));
    });
    
    expect(mockReplace).toHaveBeenCalled(); 

    // --- PASO 3: Dashboard ---
    render(<Dashboard />);
    // Ahora que agregaste el testID en Dashboard.tsx, esto debería funcionar
    const btnCrear = await screen.findByTestId('btn-nav-crear-domiciliario', {}, { timeout: 15000 });
    expect(btnCrear).toBeTruthy();
  }, 60000);
});