import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../../app/_layout'; // Asegura la ruta de tu layout principal
import { TokenStorage } from '@/core/storage/token.storage';

describe('E2E Integration: Admin Workflow', () => {
  
  beforeAll(async () => {
    // Limpiar token previo para asegurar un inicio desde cero
    await TokenStorage.removeToken();
  });

  it('1. Debe permitir al Admin loguearse correctamente', async () => {
    render(<App />);

    // Rellenar formulario
    const emailInput = await screen.findByTestId('email-input');
    const passwordInput = await screen.findByTestId('password-input');
    const loginButton = await screen.findByTestId('login-button');

    fireEvent.changeText(emailInput, 'admin@jota.com'); // Ajusta con tu credencial real
    fireEvent.changeText(passwordInput, 'password123'); // Ajusta con tu credencial real
    fireEvent.press(loginButton);

    // Esperar a que la navegación ocurra tras el login
    // Usamos findBy para esperar que aparezca un elemento del dashboard
    const dashboardTitle = await screen.findByText(/Dashboard/i, {}, { timeout: 10000 });
    expect(dashboardTitle).toBeTruthy();
  });

  it('2. Debe permitir al Admin crear un nuevo domiciliario', async () => {
    // Navegar a la creación (asumiendo botón de acceso)
    const btnCrearDomiciliario = await screen.findByTestId('btn-nav-crear-domiciliario');
    fireEvent.press(btnCrearDomiciliario);

    // Rellenar formulario de creación
    const nombreInput = await screen.findByTestId('nombre-domiciliario-input');
    const telefonoInput = await screen.findByTestId('telefono-domiciliario-input');
    const submitButton = await screen.findByTestId('submit-domiciliario-button');

    fireEvent.changeText(nombreInput, 'Domiciliario Test');
    fireEvent.changeText(telefonoInput, '3001234567');
    
    // Disparar envío
    fireEvent.press(submitButton);

    // Validar respuesta visual de éxito
    // findByText esperará a que el componente renderice el mensaje de éxito tras el response
    const successMessage = await screen.findByText(/creado exitosamente/i, {}, { timeout: 10000 });
    expect(successMessage).toBeTruthy();
  });
});