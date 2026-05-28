import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import LoginClient from '../../features/auth/presentation/LoginClient';
import CreatePedido from '../../features/delivery/presentation/CreatePedido';
import { AdminRepository } from '../../core/repositories/admin.repository';

// ← Aumentar timeout global del suite completo
jest.setTimeout(35000);

describe('Plan Maestro E2E #1: Integración Real - Flujo Completo', () => {
  afterEach(cleanup);

  // ← Timeout propio para el beforeAll
  beforeAll(async () => {
    console.log('🌱 Sembrando Admin en backend...');
    try {
      await AdminRepository.createAdmin({ 
        nombre:   'Admin Test',
        correo:   'admin_test@test.com', 
        password: 'password123'
      });
      console.log('✅ Admin creado.');
    } catch (e: any) {
      // 409 Conflict = ya existe, está bien
      const status = e?.response?.status;
      console.log(`ℹ️  Admin seed status ${status ?? 'desconocido'} — continuando.`);
    }
  }, 30000); // ← timeout del beforeAll

  // -------------------------------------------------------------------
  it('FASE 1: Autenticación', async () => {
    console.log('🔐 Iniciando FASE 1...');
    const { getByPlaceholderText, findByText } = render(<LoginClient />);
    
    fireEvent.changeText(getByPlaceholderText(/correo/i), 'admin_test@test.com');
    fireEvent.changeText(getByPlaceholderText(/contraseña/i), 'password123');
    
    console.log('📤 Presionando botón de ingreso...');
    fireEvent.press(findByText ? await findByText(/Ingresar/i) : getByPlaceholderText(/Ingresar/i));

    // ← findByText espera activamente (más robusto que waitFor + getByText)
    // LoginClient debe mostrar "Bienvenido" ANTES de navegar (ver nota abajo)
    const welcomeMsg = await findByText(/bienvenido/i, {}, { timeout: 25000 });
    expect(welcomeMsg).toBeTruthy();
    console.log('✅ FASE 1 completada.');

  }, 30000);

  // -------------------------------------------------------------------
  it('FASE 2: Registro de Pedido', async () => {
    console.log('📦 Iniciando FASE 2...');
    const { getAllByPlaceholderText, getByPlaceholderText, findByText } = render(<CreatePedido />);

    const inputsId = getAllByPlaceholderText('Ingresa ID');
    expect(inputsId.length).toBeGreaterThanOrEqual(2);

    fireEvent.changeText(inputsId[0], '1');  // ← usa IDs que existen en tu DB
    fireEvent.changeText(inputsId[1], '1');

    fireEvent.changeText(getByPlaceholderText('Carrera 00 #00-00'), 'Carrera 12 #34-56');
    fireEvent.changeText(getByPlaceholderText('0'), '50000');

    console.log('📤 Presionando Registrar Pedido...');
    fireEvent.press(await findByText(/Registrar Pedido/i));

    // ← findByText es más robusto — hace polling interno
    const confirmacion = await findByText(/creado exitosamente/i, {}, { timeout: 25000 });
    expect(confirmacion).toBeTruthy();
    console.log('✅ FASE 2 completada.');

  }, 30000);
});