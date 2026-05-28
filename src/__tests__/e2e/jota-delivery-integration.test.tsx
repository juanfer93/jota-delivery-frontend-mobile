import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import LoginClient from '../../features/auth/presentation/LoginClient';
import CreatePedido from '../../features/delivery/presentation/CreatePedido';
// Asegúrate de que esta importación sea la correcta para el archivo donde está createAdmin
import { AdminRepository } from '../../core/repositories/admin.repository'; 

describe('Plan Maestro E2E #1: Integración Real - Flujo Completo', () => {
  afterEach(cleanup);

  beforeAll(async () => {
    try {
        console.log('Sembrando Administrador en Backend...');
        // CORRECCIÓN: Usando la estructura exacta de CreateAdminDTO
        await AdminRepository.createAdmin({ 
            nombre: 'Admin Test',
            correo: 'admin_test@test.com', 
            password: 'password123'
        });
        console.log('Admin creado correctamente.');
    } catch (e) {
        console.log('El admin ya existe o hubo error, continuando...', e);
    }
  });

  it('FASE 1: Autenticación', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginClient />);
    
    // Asegúrate de que los placeholders en LoginClient coincidan con estos
    fireEvent.changeText(getByPlaceholderText(/correo/i), 'admin_test@test.com');
    fireEvent.changeText(getByPlaceholderText(/contraseña/i), 'password123');
    fireEvent.press(getByText(/Ingresar/i));

    await waitFor(() => {
      expect(getByText(/bienvenido/i)).toBeTruthy();
    }, { timeout: 15000 });
  }, 20000);

  it('FASE 2: Registro de Pedido', async () => {
    const { getAllByPlaceholderText, getByPlaceholderText, getByText } = render(<CreatePedido />);

    // CORRECCIÓN: Acceso seguro a los inputs duplicados
    const inputsId = getAllByPlaceholderText('Ingresa ID');
    
    if (inputsId.length >= 2) {
        fireEvent.changeText(inputsId[0], '123456'); // ID Domiciliario
        fireEvent.changeText(inputsId[1], '987654'); // ID Comercio
    }

    fireEvent.changeText(getByPlaceholderText('Carrera 00 #00-00'), 'Carrera 12 #34-56');
    fireEvent.changeText(getByPlaceholderText('0'), '50000');

    fireEvent.press(getByText(/Registrar Pedido/i));

    await waitFor(() => {
      expect(getByText(/creado exitosamente/i)).toBeTruthy();
    }, { timeout: 15000 });
  }, 20000);
});