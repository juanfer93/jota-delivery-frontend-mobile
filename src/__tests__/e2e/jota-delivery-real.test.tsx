import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import CreateAdminClient from '@/features/admin/presentation/CreateAdminClient';
import LoginClient from '@/features/auth/presentation/LoginClient';
import Dashboard from '@/features/dashboard/presentation/Dashboard';
import { TokenStorage } from '@/core/storage/token.storage';

jest.setTimeout(90000); // 90s para el test completo

// Mock del Router para evitar errores de navegación
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

  test('Debe crear admin, loguear y entrar al dashboard', async () => {
    // --- PASO 1: Crear Admin ---
    render(<CreateAdminClient />);
    await screen.findByText('Crear administrador inicial', {}, { timeout: 20000 });
    
    fireEvent.changeText(screen.getByTestId('admin-nombre-input'), 'Admin Real Test');
    fireEvent.changeText(screen.getByTestId('admin-email-input'), 'real-test@jota.com');
    fireEvent.changeText(screen.getByTestId('admin-password-input'), '12345678');
    fireEvent.changeText(screen.getByTestId('admin-confirmPassword-input'), '12345678');
    
    fireEvent.press(screen.getByTestId('create-admin-button'));

    // Esperamos a que el Login aparezca en pantalla (confirmación de navegación exitosa)
    await screen.findByText('Iniciar sesión', {}, { timeout: 20000 });
    console.log("Navegación al Login confirmada por UI");

    // --- PASO 2: Login ---
    // Renderizamos manualmente el Login para interactuar con él
    render(<LoginClient />);
    
    fireEvent.changeText(screen.getByTestId('email-input'), 'real-test@jota.com');
    fireEvent.press(screen.getByTestId('password-input'), '12345678');
    
    fireEvent.press(screen.getByTestId('login-button'));
    
    // Esperamos a ver elementos del Dashboard
    await screen.findByText('Bienvenido', {}, { timeout: 20000 });
    console.log("Navegación al Dashboard confirmada por UI");

    // --- PASO 3: Dashboard ---
    render(<Dashboard />);
    
    const btnCrear = await screen.findByTestId('btn-nav-crear-domiciliario', {}, { timeout: 20000 });
    expect(btnCrear).toBeTruthy();
    console.log("Test finalizado con éxito: Dashboard alcanzado");
  }); 
});