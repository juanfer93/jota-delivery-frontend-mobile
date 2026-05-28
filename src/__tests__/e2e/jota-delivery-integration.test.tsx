import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import CreateAdminClient from '@/features/admin/presentation/CreateAdminClient';
import LoginClient from '@/features/auth/presentation/LoginClient';
import Dashboard from '@/features/dashboard/presentation/Dashboard';

// Mockeamos el router para espiar la navegación
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// Mockeamos el store de admin
jest.mock('@/features/admin/application/admin.store', () => ({
  useAdminStore: jest.fn().mockReturnValue({
    createFirstAdmin: jest.fn().mockResolvedValue(undefined),
    isCreating: false,
  }),
}));

// Mock SafeArea
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
    
    // Verificamos que se intentó navegar al login
    expect(mockReplace).toHaveBeenCalledWith('/login');

    // --- PASO 2: Login ---
    // Limpiamos la pantalla anterior y renderizamos la siguiente
    jest.clearAllMocks();
    render(<LoginClient />);
    
    await screen.findByText('Iniciar sesión', { exact: false });
    
    fireEvent.changeText(screen.getByTestId('email-input'), 'admin@jota.com');
    fireEvent.changeText(screen.getByTestId('password-input'), '12345678');
    
    await act(async () => {
      fireEvent.press(screen.getByTestId('login-button'));
    });

    // --- PASO 3: Dashboard ---
    // Verificamos que se intentó navegar al dashboard (o ruta app)
    // Nota: Dependiendo de tu lógica, puede ser '/' o '/(app)/'
    expect(mockReplace).toHaveBeenCalled(); 

    // Opcional: renderizar dashboard si necesitas validar contenido
    render(<Dashboard />);
    const btnCrear = await screen.findByTestId('btn-nav-crear-domiciliario');
    expect(btnCrear).toBeTruthy();
  }, 60000);
});