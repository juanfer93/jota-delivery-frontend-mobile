import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import LoginClient from '../../features/auth/presentation/LoginClient';
import CreatePedido from '../../features/delivery/presentation/CreatePedido';

describe('Plan Maestro E2E #1: Integración Real', () => {

  afterEach(cleanup);

  it('FASE 1: Debería autenticar al Administrador exitosamente', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginClient />);

    fireEvent.changeText(getByPlaceholderText(/correo/i), 'admin_test@test.com');
    fireEvent.changeText(getByPlaceholderText(/contraseña/i), 'password123');
    fireEvent.press(getByText(/ingresar/i));

    await waitFor(() => {
      expect(getByText(/bienvenido/i)).toBeTruthy();
    }, { timeout: 15000 });
    
    console.log('Fase 1 completada');
  }, 20000);

  it('FASE 2: Debería registrar un Domiciliario exitosamente', async () => {
    const { getByPlaceholderText, getByText } = render(<CreatePedido />);

    fireEvent.changeText(getByPlaceholderText(/nombre/i), 'Domiciliario Test');
    fireEvent.press(getByText(/guardar/i));

    await waitFor(() => {
      expect(getByText(/creado exitosamente/i)).toBeTruthy();
    }, { timeout: 15000 });

    console.log('Fase 2 completada');
  }, 20000);
});