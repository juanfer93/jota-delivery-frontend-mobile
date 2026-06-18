import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { DeliveryClient } from './DeliveryClient';

const mockRefreshPedidosHoy = jest.fn().mockResolvedValue(undefined);
const mockUpdateEstado = jest.fn().mockResolvedValue(true);
const mockGetPedidosDisponibles = jest.fn();
const mockTomarPedidoDisponible = jest.fn();
const mockPush = jest.fn();
const mockAuthState = {
  user: { rol: 'domiciliario' },
};

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

jest.mock('@/core/repositories/delivery.repository', () => ({
  DeliveryRepository: {
    getPedidosDisponibles: (...args: unknown[]) => mockGetPedidosDisponibles(...args),
    tomarPedidoDisponible: (...args: unknown[]) => mockTomarPedidoDisponible(...args),
  },
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
    updateEstado: mockUpdateEstado,
  }),
}));

const availablePedido = {
  id: 'pedido-libre',
  comercioId: 'comercio-chori',
  valorFinal: 25000,
  valorDomicilio: 0,
  estado: 'EN_PROCESO',
  direccionDestino: 'Alto Prado',
  direccionRecogida: 'Chori 84',
  createdAt: '2026-06-13T20:00:00.000Z',
  domiciliarioId: null,
  usuarioId: null,
  comercio: { id: 'comercio-chori', nombre: 'Chori 84', direccion: 'Chori 84' },
};

describe('DeliveryClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState.user.rol = 'domiciliario';
    mockGetPedidosDisponibles.mockResolvedValue([availablePedido]);
    mockTomarPedidoDisponible.mockResolvedValue({ ...availablePedido, domiciliarioId: 'domi-actual' });
  });

  it('muestra al domiciliario la lista de pedidos libres y permite aceptar uno', async () => {
    render(<DeliveryClient />);

    expect(await screen.findByText('Pedidos disponibles')).toBeTruthy();
    expect(await screen.findByText('Chori 84')).toBeTruthy();
    expect(screen.getByText('Entregar: Alto Prado')).toBeTruthy();

    fireEvent.press(screen.getByTestId('accept-pedido-pedido-libre'));

    await waitFor(() => {
      expect(mockTomarPedidoDisponible).toHaveBeenCalledWith('pedido-libre');
      expect(mockPush).toHaveBeenCalledWith('/profile/current-delivery');
    });
  });

  it('avisa si otro domiciliario ya tomo el pedido', async () => {
    mockTomarPedidoDisponible.mockRejectedValueOnce({
      response: { data: { message: 'Este pedido ya fue asignado.' } },
    });

    render(<DeliveryClient />);

    await screen.findByText('Chori 84');
    fireEvent.press(screen.getByTestId('accept-pedido-pedido-libre'));

    expect(await screen.findByText('Este pedido ya fue asignado.')).toBeTruthy();
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
