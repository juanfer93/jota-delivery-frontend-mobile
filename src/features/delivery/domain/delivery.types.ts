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
  ganancia?: number;
  estado: PedidoEstado;
  direccionDestino: string;
  createdAt: string;
  updatedAt?: string;
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
  usuarioId?: string;
  domiciliarioId?: string;
  comercioId: string;
  valorFinal: number;
  valorDomicilio?: number;
  ganancia?: number;
  direccionDestino: string;
  detallesAdicionales?: string;
}

export interface UpdatePedidoEstadoDTO {
  estado: PedidoEstado;
}

export interface CurrentDeliveryItem {
  id: string;
  valorFinal: number;
  valorDomicilio: number;
  ganancia?: number;
  direccionDestino: string;
  estado: PedidoEstado;
  createdAt: string;
  updatedAt?: string;
  assignedAt?: string | null;
  clienteNombre?: string;
  clienteTelefono?: string;
  detallesAdicionales?: string;
  comercio?: {
    id: string;
    nombre: string;
    direccion: string;
  };
}
