import { User } from '@/features/auth/domain/auth.types';
import { Comercio } from '@/features/admin/domain/admin.types';

export enum PedidoEstado {
  EN_PROCESO = 'EN_PROCESO',
  HECHO = 'HECHO',
  CANCELADO = 'CANCELADO',
}

export interface Pedido {
  id: string;
  usuarioId: string;
  comercioId: string;
  valorFinal: number;
  valorDomicilio: number;
  estado: PedidoEstado;
  direccionDestino: string;
  createdAt: string;
  assignedBy?: string | null;
  assignedAt?: string | null;
  usuario?: User;
  comercio?: Comercio;
  direccionRecogida?: string;
  valorPedido?: number;
  clienteNombre?: string;
  clienteTelefono?: string;
  domiciliarioId?: string | null;
  direccionEntrega?: string;
  detallesAdicionales?: string;
}

export interface CreatePedidoDTO {
  usuarioId: string;
  comercioId: string;
  valorFinal: number;
  valorDomicilio?: number;
  direccionDestino: string;
  detallesAdicionales?: string;
}

export interface UpdatePedidoEstadoDTO {
  estado: PedidoEstado;
}
