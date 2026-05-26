export enum PedidoEstado {
    PENDIENTE = 'PENDIENTE',
    ASIGNADO = 'ASIGNADO',
    EN_CAMINO = 'EN_CAMINO',
    ENTREGADO = 'ENTREGADO',
    CANCELADO = 'CANCELADO',
}

export interface Pedido {
    id: string;
    usuarioId: string; 
    comercioId: string;
    valorFinal: number;
    valorDomicilio?: number;
    direccionDestino: string;
    estado: PedidoEstado;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreatePedidoDTO {
    usuarioId: string;
    comercioId: string;
    valorFinal: number;
    valorDomicilio?: number;
    direccionDestino: string;
}

export interface UpdatePedidoEstadoDTO {
    estado: PedidoEstado;
}