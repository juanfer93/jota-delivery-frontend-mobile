import { act, fireEvent, render, screen } from '@testing-library/react-native';
import DeliveryHistoryClient from './DeliveryHistoryClient';

const mockLoadAllHistory = jest.fn().mockResolvedValue(undefined);
const mockLoadHistory = jest.fn().mockResolvedValue(undefined);
const mockAuthState = { user: { rol: 'admin' } };

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

jest.mock('@/features/auth/application/auth.store', () => ({
  useAuthStore: (selector: (state: typeof mockAuthState) => unknown) => selector(mockAuthState),
}));

jest.mock('@/features/delivery/application/delivery.store', () => ({
  useDeliveryStore: () => ({
    pedidosHistorial: [],
    historyStatus: 'success',
    historyError: null,
    loadHistory: mockLoadHistory,
    loadAllHistory: mockLoadAllHistory,
  }),
}));

describe('DeliveryHistoryClient para admin', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockAuthState.user.rol = 'admin';
    mockLoadAllHistory.mockClear();
    mockLoadHistory.mockClear();
  });

  afterEach(() => jest.useRealTimers());

  it('busca el historial global por comercio o domiciliario', async () => {
    render(<DeliveryHistoryClient />);

    fireEvent.changeText(screen.getByTestId('search-historial-pedidos'), 'Juan');
    await act(async () => {
      jest.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(mockLoadAllHistory).toHaveBeenLastCalledWith('Juan');
  });

  it('usa el historial privado para el rol domiciliario del backend', () => {
    mockAuthState.user.rol = 'domiciliario';
    render(<DeliveryHistoryClient />);

    expect(mockLoadHistory).toHaveBeenCalledTimes(1);
    expect(mockLoadAllHistory).not.toHaveBeenCalled();
    expect(screen.queryByTestId('search-historial-pedidos')).toBeNull();
  });
});
