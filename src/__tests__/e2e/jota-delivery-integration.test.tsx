import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import LoginClient from '../../features/auth/presentation/LoginClient';
import CreatePedido from '../../features/delivery/presentation/CreatePedido';

describe('Plan Maestro E2E #1: Integración Real', () => {
  afterEach(cleanup);

  it('FASE 1: Autenticación', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginClient />);
    
    // Asegúrate de que estos placeholders coincidan exactamente con LoginClient.tsx
    fireEvent.changeText(getByPlaceholderText(/correo/i), 'admin_test@test.com');
    fireEvent.changeText(getByPlaceholderText(/contraseña/i), 'password123');
    fireEvent.press(getByText(/ingresar/i));

    await waitFor(() => {
      expect(getByText(/bienvenido/i)).toBeTruthy();
    }, { timeout: 15000 });
  }, 20000);

  it('FASE 2: Registro de Pedido', async () => {
    const { getByPlaceholderText, getByText } = render(<CreatePedido />);

    // USANDO LOS PLACEHOLDERS QUE APARECIERON EN TU LOG DE ERROR
    // Tu error decía: placeholder="Ingresa ID"
    fireEvent.changeText(getByPlaceholderText('Ingresa ID'), '123456'); 
    fireEvent.changeText(getByPlaceholderText('Carrera 00 #00-00'), 'Carrera 12 #34-56');
    fireEvent.changeText(getByPlaceholderText('0'), '50000');

    // Botón real
    fireEvent.press(getByText(/Registrar Pedido/i));

    await waitFor(() => {
      expect(getByText(/creado exitosamente/i)).toBeTruthy();
    }, { timeout: 15000 });
  }, 20000);
});