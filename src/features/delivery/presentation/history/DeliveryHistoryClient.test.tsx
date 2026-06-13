import { act, fireEvent, render, screen } from '@testing-library/react-native';
import DeliveryHistoryClient from './DeliveryHistoryClient';

const mockLoadAllHistory = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

jest.mock('@/features/auth/application/auth.store', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) => selector({
    user: { rol: 'ADMIN' },
  }),
}));

jest.mock('@/features/delivery/application/delivery.store', () => ({
  useDeliveryStore: () => ({
    pedidosHistorial: [],
    historyStatus: 'success',
    historyError: null,
    loadHistory: jest.fn(),
    loadAllHistory: mockLoadAllHistory,
  }),
}));

describe('DeliveryHistoryClient para admin', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockLoadAllHistory.mockClear();
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
});
