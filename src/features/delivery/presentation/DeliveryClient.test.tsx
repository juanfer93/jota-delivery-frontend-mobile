import { render, screen } from '@testing-library/react-native';
import { DeliveryClient } from './DeliveryClient';

const mockRefreshPedidosHoy = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useLocalSearchParams: () => ({}),
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
    }],
    status: 'success',
    error: null,
    refreshPedidosHoy: mockRefreshPedidosHoy,
    updateEstado: jest.fn(),
  }),
}));

describe('DeliveryClient', () => {
  it('bloquea todos los botones cuando el pedido esta hecho', () => {
    render(<DeliveryClient />);

    expect(screen.getByTestId('pedido-pedido-1-estado-EN_PROCESO')).toBeDisabled();
    expect(screen.getByTestId('pedido-pedido-1-estado-HECHO')).toBeDisabled();
    expect(screen.getByTestId('pedido-pedido-1-estado-CANCELADO')).toBeDisabled();
  });
});
