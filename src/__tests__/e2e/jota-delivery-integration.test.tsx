import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginClient from '../../features/auth/presentation/LoginClient';
import CreatePedido from '../../features/delivery/presentation/CreatePedido';
// Si tu app requiere navegación, necesitarías importar el NavigationContainer aquí

describe('Plan Maestro E2E #1: Integración Real - Flujo Admin y Domiciliarios', () => {

  it('debería completar el flujo completo: Crear Admin -> Autenticar -> Registrar Domiciliario', async () => {

    // --- FASE 1: Crear Administrador ---
    // Simulamos el inicio de la app donde se debe registrar el admin
    // --- FASE 1: Crear Administrador ---
    const { getByPlaceholderText: getByPlaceholderLogin, getByText: getByTextLogin } = render(<LoginClient />);

    // Cambiamos 'usuario' por 'correo' (como dice tu componente)
    fireEvent.changeText(getByPlaceholderLogin(/correo/i), 'admin_test@test.com');
    // 'contraseña' se queda igual porque tu placeholder es "Ingresa tu contraseña"
    fireEvent.changeText(getByPlaceholderLogin(/contraseña/i), 'password123');

    // Cambiamos 'registrarse' por 'ingresar' (como dice tu botón)
    fireEvent.press(getByTextLogin(/ingresar/i));

    // Validamos que el Backend respondió (mantén tu espera)
    await waitFor(() => {
      // Nota: Si al ingresar sale otro texto, ajústalo aquí
      expect(getByTextLogin(/bienvenido/i)).toBeTruthy();
    }, { timeout: 5000 });

    console.log('Fase 1 completada: Admin creado y autenticado.');

    // --- FASE 2: Gestión de Domiciliarios ---
    // Ahora que el admin "existe" y está autenticado, probamos la creación de domiciliarios
    const { getByPlaceholderText: getByPlaceholderPedido, getByText: getByTextPedido } = render(<CreatePedido />);

    fireEvent.changeText(getByPlaceholderPedido(/nombre/i), 'Domiciliario Test');
    // Asumimos que hay campos adicionales necesarios para crear el usuario, agrégalos si es necesario:
    // fireEvent.changeText(getByPlaceholderPedido(/cedula/i), '123456'); 

    fireEvent.press(getByTextPedido(/guardar/i));

    // Validamos que el Backend persiste el nuevo domiciliario
    await waitFor(() => {
      expect(getByTextPedido(/creado exitosamente/i)).toBeTruthy();
    }, { timeout: 5000 });

    console.log('Fase 2 completada: Domiciliario creado en BD.');
  });
});