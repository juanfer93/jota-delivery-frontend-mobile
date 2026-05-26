import { User } from '@/features/auth/domain/auth.types';

export interface Comercio {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComercioDTO {
  nombre: string;
  direccion: string;
  telefono: string;
}

export interface CreateDomiciliarioDTO {
  nombre: string;
  correo: string;
  telefono: string;
  vehiculo?: string;
  placa?: string;
  password?: string; 
}

export type DomiciliarioItem = User;

export interface AdminStatusResponse {
  active: boolean;
}

export interface CreateAdminDTO {
  nombre: string;
  correo: string;
  password?: string;
}