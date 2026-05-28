const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import CreateAdminClient from '@/features/admin/presentation/CreateAdminClient';
import LoginClient from '@/features/auth/presentation/LoginClient';
import Dashboard from '@/features/dashboard/presentation/Dashboard';
import { TokenStorage } from '@/core/storage/token.storage';

jest.setTimeout(90000); // 90s para el test completo


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
    await screen.findByText('Crear administrador inicial', { exact: false });

    fireEvent.changeText(screen.getByTestId('admin-nombre-input'), 'Admin Real Test');
    fireEvent.changeText(screen.getByTestId('admin-email-input'), 'real-test@jota.com');
    fireEvent.changeText(screen.getByTestId('admin-password-input'), '12345678');
    fireEvent.changeText(screen.getByTestId('admin-confirmPassword-input'), '12345678');

    fireEvent.press(screen.getByTestId('create-admin-button'));

    // CAMBIO CLAVE: En lugar de esperar al mock, esperamos a que el Login se renderice
    // Si esto pasa, significa que la navegación ocurrió.
    await screen.findByText('Iniciar sesión', { exact: false, timeout: 20000 });
    console.log("Navegación al Login confirmada por UI");

    // --- PASO 2: Login ---
    // No hace falta renderizar LoginClient de nuevo, ya está en pantalla porque navegamos
    fireEvent.changeText(screen.getByTestId('email-input'), 'real-test@jota.com');
    fireEvent.changeText(screen.getByTestId('password-input'), '12345678');

    fireEvent.press(screen.getByTestId('login-button'));

    // Esperamos a ver elementos del Dashboard (ej. un texto que solo salga ahí)
    await screen.findByText('Bienvenido', { exact: false, timeout: 20000 });
    console.log("Navegación al Dashboard confirmada por UI");

    // --- PASO 3: Dashboard ---
    const btnCrear = await screen.findByTestId('btn-nav-crear-domiciliario', {}, { timeout: 20000 });
    expect(btnCrear).toBeTruthy();
  });
});