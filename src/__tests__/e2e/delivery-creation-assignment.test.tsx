import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import CreatePedido from '@/features/delivery/presentation/CreatePedido';

const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockAssignPedido = jest.fn();
const mockLoadData = jest.fn();

jest.setTimeout(30000);

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
    back: mockBack,
    push: jest.fn(),
  }),
  router: {
    replace: mockReplace,
    back: mockBack,
    push: jest.fn(),
  },
}));

jest.mock('@/features/delivery/application/delivery.store', () => ({
  useDeliveryStore: () => ({
    assignPedido: mockAssignPedido,
    status: 'idle',
    error: null,
    pedidosHoy: [
      {
        id: 'pedido-activo',
        usuarioId: 'domi-busy',
        domiciliarioId: 'domi-busy',
        estado: 'EN_PROCESO',
      },
    ],
    domiciliarios: [
      {
        id: 'domi-free',
        nombre: 'Domi Libre',
        email: 'libre@test.com',
        rol: 'domiciliario',
        bloqueado: false,
      },
      {
        id: 'domi-busy',
        nombre: 'Domi Ocupado',
        email: 'ocupado@test.com',
        rol: 'domiciliario',
        bloqueado: false,
      },
    ],
    comercios: [
      {
        id: '1beb752b-8590-4c69-9cbe-bc7714a9ee94',
        nombre: 'Comercio Uno',
        direccion: 'Calle 1',
        telefono: '3000000000',
        estado: true,
        createdAt: '',
        updatedAt: '',
      },
    ],
    loadData: mockLoadData,
  }),
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');

  return {
    SafeAreaProvider: ({ children }: any) =>
      React.createElement('View', null, children),
    SafeAreaView: ({ children }: any) =>
      React.createElement('View', null, children),
    useSafeAreaInsets: () => ({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    }),
  };
});

beforeEach(() => {
  mockAssignPedido.mockClear();
  mockBack.mockClear();
  mockReplace.mockClear();
  mockLoadData.mockClear();
});

test('E2E: Crear pedido con asignacion automatica y comercio existente', async () => {
  mockAssignPedido.mockResolvedValue(true);

  render(<CreatePedido />);

  const comercioOption = await screen.findByTestId(
    'comercio-option-1beb752b-8590-4c69-9cbe-bc7714a9ee94',
  );

  fireEvent.press(comercioOption);
  fireEvent.changeText(screen.getByTestId('direccionDestino-input'), 'Carrera 10 #20-30');
  fireEvent.changeText(screen.getByTestId('valorFinal-input'), '25000');
  fireEvent.changeText(screen.getByTestId('detalles-input'), 'Entrega con precaución.');
  fireEvent.press(screen.getByTestId('create-pedido-button'));

  await waitFor(
    () => {
      expect(mockAssignPedido).toHaveBeenCalledWith({
        comercioId: '1beb752b-8590-4c69-9cbe-bc7714a9ee94',
        valorFinal: 25000,
        valorDomicilio: 0,
        direccionDestino: 'Carrera 10 #20-30',
        detallesAdicionales: 'Entrega con precaución.',
      });
    },
    { timeout: 5000 },
  );

  await waitFor(
    () => {
      expect(mockReplace).toHaveBeenCalledWith('/(app)/delivery');
    },
    { timeout: 3000 },
  );

  expect(mockBack).not.toHaveBeenCalled();
});

test('E2E: Crear pedido con asignacion manual manda domiciliarioId libre', async () => {
  mockAssignPedido.mockResolvedValue(true);

  render(<CreatePedido />);

  fireEvent.press(screen.getByTestId('assignment-manual-button'));

  const domiciliarioOption = await screen.findByTestId(
    'domiciliario-option-domi-free',
  );

  fireEvent.press(domiciliarioOption);

  const comercioOption = await screen.findByTestId(
    'comercio-option-1beb752b-8590-4c69-9cbe-bc7714a9ee94',
  );

  fireEvent.press(comercioOption);
  fireEvent.changeText(screen.getByTestId('direccionDestino-input'), 'Carrera 10 #20-30');
  fireEvent.changeText(screen.getByTestId('valorFinal-input'), '25000');
  fireEvent.press(screen.getByTestId('create-pedido-button'));

  await waitFor(() => {
    expect(mockAssignPedido).toHaveBeenCalledWith(
      expect.objectContaining({
        comercioId: '1beb752b-8590-4c69-9cbe-bc7714a9ee94',
        domiciliarioId: 'domi-free',
      }),
    );
  });
});

test('E2E: No permite escoger domiciliario ocupado en manual', async () => {
  render(<CreatePedido />);

  fireEvent.press(screen.getByTestId('assignment-manual-button'));

  const busyOption = await screen.findByTestId('domiciliario-option-domi-busy');

  fireEvent.press(busyOption);

  expect(mockAssignPedido).not.toHaveBeenCalled();
});