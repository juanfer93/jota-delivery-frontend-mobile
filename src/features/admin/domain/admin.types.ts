import { UserRole } from '@/features/auth/domain/auth.types';

export interface DomiciliarioItem {
  id: string;
  nombre: string;
  email: string;
  rol?: UserRole;
  saldo?: number;
  codigo?: string;
}

export interface ComercioItem {
  id: string;
  nombre: string;
}

export interface CreateAdminDTO {
  nombre: string;
  email: string;
  password?: string;
}

export interface CreateDomiciliarioDTO {
  nombre: string;
  email: string;
}

export interface SetPasswordDTO {
  token: string;
  password: string;
}

export interface AdminStatusResponse {
  hasAdmin: boolean;
  adminName?: string;
}