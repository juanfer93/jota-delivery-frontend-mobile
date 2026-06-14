import { fireEvent, render, screen } from '@testing-library/react-native';
import { DeliveryClient } from './DeliveryClient';

const mockRefreshPedidosHoy = jest.fn().mockResolvedValue(undefined);
const mockLogout = jest.fn().mockResolvedValue(undefined);
const mockAuthState = {
  user: { rol: 'domiciliario' },
  logout: mockLogout,
};

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

jest.mock('@/features/auth/application/auth.store', () => ({
  useAuthStore: (selector: (state: typeof mockAuthState) => unknown) => selector(mockAuthState),
}));

jest.mock('../application/delivery.store', () => ({
  useDeliveryStore: () => ({
    pedidosHoy: [{
      id: 'pedido-1',
      usuarioId: 'domi-1',
      comercioId: 'comercio-1',
      valorFinal: 53000,
      valorDomicilio: 0,
      estado: 'HECHO',
      direccionDestino: 'Carrera 20 # 20-20',
      createdAt: '2026-06-13T19:49:00.000Z',
      usuario: { id: 'domi-1', nombre: 'Juanchito 2' },
      comercio: { id: 'comercio-1', nombre: 'Cualquiera' },
    }, {
      id: 'pedido-2',
      usuarioId: 'domi-2',
      comercioId: 'comercio-2',
      valorFinal: 20000,
      valorDomicilio: 0,
      estado: 'EN_PROCESO',
      direccionDestino: 'Calle 2',
      createdAt: '2026-06-13T20:00:00.000Z',
      usuario: { id: 'domi-2', nombre: 'Maria' },
      comercio: { id: 'comercio-2', nombre: 'Pizza Sur' },
    }],
    status: 'success',
    error: null,
    refreshPedidosHoy: mockRefreshPedidosHoy,
    updateEstado: jest.fn(),
  }),
}));

describe('DeliveryClient', () => {
  beforeEach(() => {
    mockAuthState.user.rol = 'domiciliario';
  });

  it('bloquea todos los botones cuando el pedido esta hecho', () => {
    render(<DeliveryClient />);

    expect(screen.getByTestId('pedido-pedido-1-estado-EN_PROCESO')).toBeDisabled();
    expect(screen.getByTestId('pedido-pedido-1-estado-HECHO')).toBeDisabled();
    expect(screen.getByTestId('pedido-pedido-1-estado-CANCELADO')).toBeDisabled();
  });

  it('no muestra la creacion de pedidos al domiciliario', () => {
    render(<DeliveryClient />);

    expect(screen.queryByTestId('btn-crear-pedido')).toBeNull();
    expect(screen.getByTestId('btn-historial-pedidos')).toBeTruthy();
  });

  it('mantiene la creacion de pedidos disponible para admin', () => {
    mockAuthState.user.rol = 'admin';
    render(<DeliveryClient />);

    expect(screen.getByTestId('btn-crear-pedido')).toBeTruthy();
  });

  it('filtra los pedidos del admin por domiciliario y comercio', () => {
    mockAuthState.user.rol = 'admin';
    render(<DeliveryClient />);

    fireEvent.changeText(screen.getByTestId('filter-pedidos-domiciliario'), 'maria');
    expect(screen.getByText('Pizza Sur')).toBeTruthy();
    expect(screen.queryByText('Cualquiera')).toBeNull();

    fireEvent.changeText(screen.getByTestId('filter-pedidos-comercio'), 'otro');
    expect(screen.getByText('No hay pedidos que coincidan con los filtros.')).toBeTruthy();
  });
});
