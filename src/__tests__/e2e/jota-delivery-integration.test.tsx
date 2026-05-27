import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginClient from '../../features/auth/presentation/LoginClient';
import CreatePedido from '../../features/delivery/presentation/CreatePedido';
// Si tu app requiere navegación, necesitarías importar el NavigationContainer aquí

describe('Plan Maestro E2E #1: Integración Real - Flujo Admin y Domiciliarios', () => {

  it('debería completar el flujo completo: Crear Admin -> Autenticar -> Registrar Domiciliario', async () => {
    
    // --- FASE 1: Crear Administrador ---
    // Simulamos el inicio de la app donde se debe registrar el admin
    const { getByPlaceholderText: getByPlaceholderLogin, getByText: getByTextLogin } = render(<LoginClient />);
    
    fireEvent.changeText(getByPlaceholderLogin(/usuario/i), 'admin_test');
    fireEvent.changeText(getByPlaceholderLogin(/contraseña/i), 'password123');
    fireEvent.press(getByTextLogin(/registrarse/i));

    // Validamos que el Backend procesó la creación del admin exitosamente (201)
    await waitFor(() => {
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