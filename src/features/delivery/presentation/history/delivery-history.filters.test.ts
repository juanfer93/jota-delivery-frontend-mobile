import { UserRole } from '@/features/auth/domain/auth.types';
import { Pedido, PedidoEstado } from '@/features/delivery/domain/delivery.types';
import {
  INITIAL_DELIVERY_HISTORY_FILTERS,
  filterDeliveryHistory,
  formatMoney,
  getBaseHistoryPedidos,
  getTimeFilterError,
} from './delivery-history.filters';

function buildPedido(overrides: Partial<Pedido> = {}): Pedido {
  return {
    id: 'pedido-001',
    usuarioId: 'domi-001',
    comercioId: 'comercio-001',
    valorFinal: 25000,
    valorDomicilio: 0,
    estado: PedidoEstado.EN_PROCESO,
    direccionDestino: 'Carrera 10 #20-30',
    createdAt: '2026-06-14T13:30:00.000Z',
    updatedAt: '2026-06-14T13:40:00.000Z',
    clienteNombre: 'Cliente Uno',
    clienteTelefono: '3001234567',
    detallesAdicionales: 'Entrega con precaución',
    usuario: {
      id: 'domi-001',
      nombre: 'Juan Domiciliario',
      email: 'juan@jota.com',
      rol: UserRole.DOMICILIARIO,
    },
    comercio: {
      id: 'comercio-001',
      nombre: 'Restaurante Uno',
      direccion: 'Calle 1',
      telefono: '3000000000',
      estado: true,
      createdAt: '',
      updatedAt: '',
    },
    ...overrides,
  };
}

describe('delivery-history.filters', () => {
  it('define los filtros iniciales vacíos', () => {
    expect(INITIAL_DELIVERY_HISTORY_FILTERS).toEqual({
      domiciliario: '',
      pedido: '',
      startTime: '',
      endTime: '',
    });
  });

  it('valida formato incorrecto de hora', () => {
    expect(getTimeFilterError('8am', '')).toBe(
      'Usa el formato HH:mm. Ejemplo: 08:00 o 18:30.',
    );

    expect(getTimeFilterError('', '25:00')).toBe(
      'Usa el formato HH:mm. Ejemplo: 08:00 o 18:30.',
    );
  });

  it('valida cuando la hora inicial es mayor que la hora final', () => {
    expect(getTimeFilterError('18:00', '08:00')).toBe(
      'La hora inicial no puede ser mayor que la hora final.',
    );
  });

  it('retorna null cuando el rango de hora es válido', () => {
    expect(getTimeFilterError('08:00', '18:30')).toBeNull();
    expect(getTimeFilterError('', '')).toBeNull();
  });

  it('para admin retorna todos los pedidos base', () => {
    const pedidos = [
      buildPedido({ id: 'pedido-001', estado: PedidoEstado.EN_PROCESO }),
      buildPedido({ id: 'pedido-002', estado: PedidoEstado.HECHO }),
      buildPedido({ id: 'pedido-003', estado: PedidoEstado.CANCELADO }),
    ];

    expect(getBaseHistoryPedidos(pedidos, false)).toHaveLength(3);
  });

  it('para domiciliario retorna solo pedidos finalizados o cancelados', () => {
    const pedidos = [
      buildPedido({ id: 'pedido-001', estado: PedidoEstado.EN_PROCESO }),
      buildPedido({ id: 'pedido-002', estado: PedidoEstado.HECHO }),
      buildPedido({ id: 'pedido-003', estado: PedidoEstado.CANCELADO }),
    ];

    const result = getBaseHistoryPedidos(pedidos, true);

    expect(result).toHaveLength(2);
    expect(result.map((pedido) => pedido.id)).toEqual([
      'pedido-002',
      'pedido-003',
    ]);
  });

  it('filtra historial admin por domiciliario', () => {
    const pedidos = [
      buildPedido({
        id: 'pedido-001',
        usuario: {
          id: 'domi-001',
          nombre: 'Juan Domiciliario',
          email: 'juan@jota.com',
          rol: UserRole.DOMICILIARIO,
        },
      }),
      buildPedido({
        id: 'pedido-002',
        usuario: {
          id: 'domi-002',
          nombre: 'Carlos Repartidor',
          email: 'carlos@jota.com',
          rol: UserRole.DOMICILIARIO,
        },
      }),
    ];

    const result = filterDeliveryHistory({
      pedidos,
      filters: {
        ...INITIAL_DELIVERY_HISTORY_FILTERS,
        domiciliario: 'carlos',
      },
      isDomiciliario: false,
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('pedido-002');
  });

  it('filtra historial por datos del pedido', () => {
    const pedidos = [
      buildPedido({
        id: 'pedido-001',
        comercio: {
          id: 'comercio-001',
          nombre: 'Restaurante Uno',
          direccion: 'Calle 1',
          telefono: '3000000000',
          estado: true,
          createdAt: '',
          updatedAt: '',
        },
      }),
      buildPedido({
        id: 'pedido-002',
        direccionDestino: 'Avenida Siempre Viva',
        comercio: {
          id: 'comercio-002',
          nombre: 'Pizza Express',
          direccion: 'Calle 2',
          telefono: '3000000001',
          estado: true,
          createdAt: '',
          updatedAt: '',
        },
      }),
    ];

    const result = filterDeliveryHistory({
      pedidos,
      filters: {
        ...INITIAL_DELIVERY_HISTORY_FILTERS,
        pedido: 'pizza',
      },
      isDomiciliario: false,
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('pedido-002');
  });

  it('filtra historial por rango de hora Colombia', () => {
    const pedidos = [
      buildPedido({
        id: 'pedido-0830',
        createdAt: '2026-06-14T13:30:00.000Z',
      }),
      buildPedido({
        id: 'pedido-1245',
        createdAt: '2026-06-14T17:45:00.000Z',
      }),
    ];

    const result = filterDeliveryHistory({
      pedidos,
      filters: {
        ...INITIAL_DELIVERY_HISTORY_FILTERS,
        startTime: '08:00',
        endTime: '09:00',
      },
      isDomiciliario: false,
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('pedido-0830');
  });

  it('retorna vacío si existe error en el filtro de hora', () => {
    const pedidos = [
      buildPedido({ id: 'pedido-001' }),
    ];

    const result = filterDeliveryHistory({
      pedidos,
      filters: {
        ...INITIAL_DELIVERY_HISTORY_FILTERS,
        startTime: '18:00',
        endTime: '08:00',
      },
      isDomiciliario: false,
      timeFilterError: 'La hora inicial no puede ser mayor que la hora final.',
    });

    expect(result).toEqual([]);
  });

  it('no aplica filtro de domiciliario cuando el usuario es domiciliario', () => {
    const pedidos = [
      buildPedido({
        id: 'pedido-001',
        usuario: {
          id: 'domi-001',
          nombre: 'Juan Domiciliario',
          email: 'juan@jota.com',
          rol: UserRole.DOMICILIARIO,
        },
      }),
    ];

    const result = filterDeliveryHistory({
      pedidos,
      filters: {
        ...INITIAL_DELIVERY_HISTORY_FILTERS,
        domiciliario: 'otro nombre',
      },
      isDomiciliario: true,
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('pedido-001');
  });

  it('formatea valores monetarios en formato colombiano', () => {
    expect(formatMoney(25000)).toBe('25.000');
    expect(formatMoney(undefined)).toBe('0');
  });
});