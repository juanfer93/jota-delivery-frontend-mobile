import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../../app/_layout';
import { TokenStorage } from '@/core/storage/token.storage';
import { useAuthStore } from '@/features/auth/application/auth.store';

// Función auxiliar para resetear el estado de Zustand antes de cada test
const resetStore = () => {
  useAuthStore.setState({ 
    user: null, 
    isAuthenticated: false, 
    hasAdmin: null 
  });
};

describe('E2E Integration: Admin Bootstrap & Workflow', () => {
  
  beforeEach(async () => {
    await TokenStorage.removeToken();
    resetStore();
  });

  it('1. Debe detectar BD vacía y crear el primer Admin', async () => {
    render(<App />);

    // 1. Verificar carga inicial
    // Buscamos algo que indique que la app está decidiendo el estado
    // Si tu ActivityIndicator no tiene testID, busca por el componente
    const loading = await screen.findByTestId('activity-indicator'); // Recomendación: agrega testID al spinner en _layout
    expect(loading).toBeTruthy();

    // 2. Esperar redirección a /create-admin
    // findByText esperará a que el Layout haga el replace
    const adminTitle = await screen.findByText(/Crear Administrador/i, {}, { timeout: 15000 });
    expect(adminTitle).toBeTruthy();

    // 3. Crear Admin
    fireEvent.changeText(screen.getByTestId('admin-name-input'), 'Admin Jota');
    fireEvent.changeText(screen.getByTestId('admin-email-input'), 'admin@jota.com');
    fireEvent.changeText(screen.getByTestId('admin-password-input'), 'password123');
    fireEvent.press(screen.getByTestId('create-admin-button'));

    // Esperar a que la app redirija al login tras crear el admin
    const loginTitle = await screen.findByText(/Iniciar sesión/i, {}, { timeout: 10000 });
    expect(loginTitle).toBeTruthy();
  });

  it('2. Debe permitir al Admin loguearse', async () => {
    render(<App />);

    // Esperar a que pase el check de admin y nos deje en el login
    const loginTitle = await screen.findByText(/Iniciar sesión/i, {}, { timeout: 10000 });
    expect(loginTitle).toBeTruthy();

    fireEvent.changeText(screen.getByTestId('email-input'), 'admin@jota.com');
    fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
    fireEvent.press(screen.getByTestId('login-button'));

    const dashboard = await screen.findByText(/Dashboard/i, {}, { timeout: 10000 });
    expect(dashboard).toBeTruthy();
  });

  it('3. Debe permitir al Admin crear un domiciliario', async () => {
    // (Asumiendo que el estado de auth persiste o se simula)
    // Este test es igual al anterior, pero ahora sabemos que el flujo es correcto
    const btnCrear = await screen.findByTestId('btn-nav-crear-domiciliario');
    fireEvent.press(btnCrear);

    fireEvent.changeText(screen.getByTestId('nombre-domiciliario-input'), 'Domiciliario Test');
    fireEvent.changeText(screen.getByTestId('telefono-domiciliario-input'), '3001234567');
    fireEvent.press(screen.getByTestId('submit-domiciliario-button'));

    const success = await screen.findByText(/creado exitosamente/i, {}, { timeout: 10000 });
    expect(success).toBeTruthy();
  });
});