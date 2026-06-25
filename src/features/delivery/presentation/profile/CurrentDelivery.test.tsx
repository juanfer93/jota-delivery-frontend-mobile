import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { CurrentDelivery } from './CurrentDelivery';
import { PedidoEstado } from '../../domain/delivery.types';

const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockLoadCurrentDelivery = jest.fn().mockResolvedValue(undefined);
const mockUpdateEstado = jest.fn().mockResolvedValue(true);

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    canGoBack: () => false,
    replace: mockReplace,
  }),
}));

jest.mock('@/features/delivery/application/delivery.store', () => ({
  useDeliveryStore: () => ({
    currentDelivery: {
      id: 'pedido-en-curso',
      estado: 'EN_PROCESO',
      valorFinal: 30000,
      valorDomicilio: 5000,
      direccionDestino: 'Calle 10 # 20-30',
      createdAt: '2026-06-19T04:00:00.000Z',
      clienteNombre: 'Cliente Actual',
      clienteTelefono: '3007654321',
      detallesAdicionales: 'Pago en efectivo',
      comercio: {
        id: 'comercio-1',
        nombre: 'Comercio de prueba',
        direccion: 'Carrera 1 # 2-3',
      },
    },
    currentDeliveryStatus: 'success',
    currentDeliveryError: null,
    loadCurrentDelivery: mockLoadCurrentDelivery,
    updateEstado: mockUpdateEstado,
  }),
}));

describe('CurrentDelivery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadCurrentDelivery.mockResolvedValue(undefined);
    mockUpdateEstado.mockResolvedValue(true);
  });

  it('vuelve a pedidos despues de finalizar el servicio', async () => {
    render(<CurrentDelivery />);

    expect(screen.getByText('Pedido en proceso')).toBeTruthy();
    expect(screen.getByText('Recoger en Comercio de prueba, Carrera 1 # 2-3. Entregar en Calle 10 # 20-30.')).toBeTruthy();
    expect(screen.getByText('Detalles: ')).toBeTruthy();

    fireEvent.press(screen.getByTestId('current-delivery-finish'));

    await waitFor(() => {
      expect(mockUpdateEstado).toHaveBeenCalledWith(
        'pedido-en-curso',
        PedidoEstado.HECHO,
        { refresh: 'current' },
      );
      expect(mockReplace).toHaveBeenCalledWith('/(app)/delivery');
    });
  });
});
