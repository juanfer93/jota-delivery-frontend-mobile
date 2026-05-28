import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import CreateAdminClient from '@/features/admin/presentation/CreateAdminClient';
import LoginClient from '@/features/auth/presentation/LoginClient';
import Dashboard from '@/features/dashboard/presentation/Dashboard';
import { TokenStorage } from '@/core/storage/token.storage';

// 1. Mock de Router: Solo capturamos la navegación
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// 2. Mock de SafeArea: Necesario para el renderizado
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
    // Limpiamos token local antes de empezar
    await TokenStorage.removeToken();
  });

  test('Debe crear admin, loguear y entrar al dashboard (Backend Real)', async () => {
    
    // --- PASO 1: Crear Admin ---
    render(<CreateAdminClient />);
    await screen.findByText('Crear administrador inicial', { exact: false }, { timeout: 15000 });
    
    fireEvent.changeText(screen.getByTestId('admin-nombre-input'), 'Admin Real Test');
    fireEvent.changeText(screen.getByTestId('admin-email-input'), 'real-test@jota.com');
    fireEvent.changeText(screen.getByTestId('admin-password-input'), '12345678');
    fireEvent.changeText(screen.getByTestId('admin-confirmPassword-input'), '12345678');
    
    // Esta llamada irá a tu backend real en 192.168.1.10:3000
    await act(async () => {
      fireEvent.press(screen.getByTestId('create-admin-button'));
    });
    
    // Verificamos que navegó al login tras creación exitosa
    expect(mockReplace).toHaveBeenCalledWith('/login');

    // --- PASO 2: Login ---
    jest.clearAllMocks();
    render(<LoginClient />);
    
    await screen.findByText('Iniciar sesión', { exact: false }, { timeout: 15000 });
    
    fireEvent.changeText(screen.getByTestId('email-input'), 'real-test@jota.com');
    fireEvent.changeText(screen.getByTestId('password-input'), '12345678');
    
    // Esta llamada hará el login real contra el backend
    await act(async () => {
      fireEvent.press(screen.getByTestId('login-button'));
    });
    
    // Verificamos que el router intentó cambiar de ruta tras login
    expect(mockReplace).toHaveBeenCalled(); 

    // --- PASO 3: Dashboard ---
    // Renderizamos Dashboard, este hará una petición GET real al cargar
    render(<Dashboard />);
    
    // Buscamos el elemento del Dashboard real
    const btnCrear = await screen.findByTestId('btn-nav-crear-domiciliario', {}, { timeout: 20000 });
    expect(btnCrear).toBeTruthy();
  }, 90000); 
});