import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import CreatePedido from '@/features/delivery/presentation/CreatePedido';

const mockBack = jest.fn();
const mockAssignPedido = jest.fn();
const mockLoadData = jest.fn();

jest.setTimeout(30000);

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), back: mockBack, push: jest.fn() }),
  router: { replace: jest.fn(), back: mockBack, push: jest.fn() },
}));

jest.mock('@/features/delivery/application/delivery.store', () => ({
  useDeliveryStore: () => ({
    assignPedido: mockAssignPedido,
    status: 'idle',
    domiciliarios: [
      { id: '5d6517de-c78a-4b99-bdb4-d981c13c27c5', nombre: 'Domi Uno', email: 'domi1@jota.com', rol: 'DOMICILIARIO' },
    ],
    comercios: [
      { id: '1beb752b-8590-4c69-9cbe-bc7714a9ee94', nombre: 'Comercio Uno', direccion: 'Calle 1', telefono: '3000000000', estado: true, createdAt: '', updatedAt: '' }],
    loadData: mockLoadData,
  }),
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }: any) => React.createElement('View', null, children),
    SafeAreaView: ({ children }: any) => React.createElement('View', null, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

beforeEach(() => {
  mockAssignPedido.mockClear();
  mockBack.mockClear();
  mockLoadData.mockClear();
});

test('E2E: Crear pedido asignado a domiciliario y comercio existente', async () => {
  mockAssignPedido.mockResolvedValue(true);

  render(<CreatePedido />);

  const domicilioOption = await screen.findByTestId('domiciliario-option-5d6517de-c78a-4b99-bdb4-d981c13c27c5');
  fireEvent.press(domicilioOption);

  const comercioOption = await screen.findByTestId('comercio-option-1beb752b-8590-4c69-9cbe-bc7714a9ee94');
  fireEvent.press(comercioOption);

  fireEvent.changeText(screen.getByTestId('direccionDestino-input'), 'Carrera 10 #20-30');
  fireEvent.changeText(screen.getByTestId('valorFinal-input'), '25000');
  fireEvent.changeText(screen.getByTestId('detalles-input'), 'Entrega con precaución.');

  fireEvent.press(screen.getByTestId('create-pedido-button'));

  await waitFor(() => {
    expect(mockAssignPedido).toHaveBeenCalledWith({
      usuarioId: '5d6517de-c78a-4b99-bdb4-d981c13c27c5',
      comercioId: '1beb752b-8590-4c69-9cbe-bc7714a9ee94',
      valorFinal: 25000,
      valorDomicilio: 0,
      direccionDestino: 'Carrera 10 #20-30',
      detallesAdicionales: 'Entrega con precaución.',
    });
  }, { timeout: 5000 });

  await waitFor(() => {
    expect(mockBack).toHaveBeenCalled();
  }, { timeout: 3000 });
});
