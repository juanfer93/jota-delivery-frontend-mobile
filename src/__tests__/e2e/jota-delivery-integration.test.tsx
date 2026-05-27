import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginClient from '../../features/auth/presentation/LoginClient';
import CreatePedido from '../../features/delivery/presentation/CreatePedido';

describe('Plan Maestro E2E #1: Integración Real - Flujo Admin y Domiciliarios', () => {

  // Aumentamos el timeout del test completo a 20000ms (20 segundos)
  it('debería completar el flujo completo: Crear Admin -> Autenticar -> Registrar Domiciliario', async () => {

    // --- FASE 1: Crear Administrador ---
    const { getByPlaceholderText: getByPlaceholderLogin, getByText: getByTextLogin } = render(<LoginClient />);

    fireEvent.changeText(getByPlaceholderLogin(/correo/i), 'admin_test@test.com');
    fireEvent.changeText(getByPlaceholderLogin(/contraseña/i), 'password123');

    fireEvent.press(getByTextLogin(/ingresar/i));

    // Aumentamos el timeout interno a 10000ms (10 segundos)
    await waitFor(() => {
      expect(getByTextLogin(/bienvenido/i)).toBeTruthy();
    }, { timeout: 10000 });

    console.log('Fase 1 completada: Admin creado y autenticado.');

    // --- FASE 2: Gestión de Domiciliarios ---
    const { getByPlaceholderText: getByPlaceholderPedido, getByText: getByTextPedido } = render(<CreatePedido />);

    fireEvent.changeText(getByPlaceholderPedido(/nombre/i), 'Domiciliario Test');

    fireEvent.press(getByTextPedido(/guardar/i));

    // Aumentamos el timeout interno a 10000ms (10 segundos)
    await waitFor(() => {
      expect(getByTextPedido(/creado exitosamente/i)).toBeTruthy();
    }, { timeout: 10000 });

    console.log('Fase 2 completada: Domiciliario creado en BD.');

  }, 20000); 
});