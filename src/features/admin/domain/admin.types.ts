import { User } from '@/features/auth/domain/auth.types';

export interface Comercio {
  id: string;
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

export type DomiciliarioItem = User;

export interface CreateAdminDTO {
  nombre: string;
  email: string;   
  password: string;
  rol: 'admin';    
}

export interface CreateDomiciliarioDTO {
  nombre: string;
  email: string;
}
