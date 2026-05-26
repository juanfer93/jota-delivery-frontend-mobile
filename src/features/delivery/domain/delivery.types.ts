import { User } from '@/features/auth/domain/auth.types';
import { Comercio } from '@/features/admin/domain/admin.types';

export enum PedidoEstado {
  PENDIENTE = 'PENDIENTE',
  ASIGNADO = 'ASIGNADO',
  EN_CAMINO = 'EN_CAMINO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
}

export interface Pedido {
  id: number;
  clienteNombre: string;
  clienteTelefono: string;
  direccionRecogida: string;
  direccionEntrega: string;
  detallesAdicionales?: string;
  
  valorPedido: number;
  valorDomicilio: number;
  estado: PedidoEstado;

  comercioId: number;
  comercio?: Comercio; 
  
  domiciliarioId?: number | null;
  domiciliario?: User | null;

  fechaCreacion: string; 
  fechaActualizacion: string; 
}

export interface CreatePedidoDTO {
  clienteNombre: string;
  clienteTelefono: string;
  direccionRecogida: string;
  direccionEntrega: string;
  detallesAdicionales?: string;
  valorPedido: number;
  valorDomicilio: number;
  comercioId: number;
  domiciliarioId?: number; 
}

export interface UpdatePedidoEstadoDTO {
  pedidoId: number;
  nuevoEstado: PedidoEstado;
  domiciliarioId?: number; 
}