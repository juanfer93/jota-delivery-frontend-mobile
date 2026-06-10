import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { CreateComercioScreen } from '@/features/admin/presentation/CreateComercioScreen';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
  router: { push: mockPush, replace: jest.fn(), back: jest.fn() },
}));

const mockCreateComercio = jest.fn();
const mockClearComercioMessages = jest.fn();

jest.mock('@/features/admin/application/admin.store', () => ({
  useAdminStore: () => ({
    isCreatingComercio: false,
    comercioMessage: null,
    comercioError: null,
    clearComercioMessages: mockClearComercioMessages,
    createComercio: mockCreateComercio,
  }),
}));

describe('E2E: Crear comercio', () => {
  beforeEach(() => {
    mockCreateComercio.mockClear();
    mockClearComercioMessages.mockClear();
    mockPush.mockClear();
  });

  test('Admin puede crear un comercio con nombre, dirección y teléfono', async () => {
    mockCreateComercio.mockResolvedValueOnce(true);

    render(<CreateComercioScreen />);

    await screen.findByTestId('screen-title');

    fireEvent.changeText(screen.getByTestId('nombre-input'), 'Panadería La Crème');
    fireEvent.changeText(screen.getByTestId('direccion-input'), 'Av. Central 123');
    fireEvent.changeText(screen.getByTestId('telefono-input'), '3211234567');

    fireEvent.press(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockCreateComercio).toHaveBeenCalledWith({
        nombre: 'Panadería La Crème',
        direccion: 'Av. Central 123',
        telefono: '3211234567',
      });
    }, { timeout: 5000 });
  });
});
