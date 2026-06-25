export enum UserRole {
  ADMIN = 'admin',
  DOMICILIARIO = 'domiciliario',
}

export function normalizeUserRole(rol?: string | null): string {
  return rol?.toLowerCase() ?? '';
}

export function isDomiciliarioRole(rol?: string | null): boolean {
  return normalizeUserRole(rol) === UserRole.DOMICILIARIO;
}

export function isAdminRole(rol?: string | null): boolean {
  return normalizeUserRole(rol) === UserRole.ADMIN;
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  codigo?: string;
  saldo?: number;
  gananciaDia?: number;
  bloqueado?: boolean;
  email_confirmado?: boolean;
  createdAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  usuario: User;
}

export interface RawLoginResponse {
  data: LoginResponse;
  success: boolean;
  timestamp: string;
}

export interface SetPasswordDTO {
  token: string;
  password: string;
}

export interface ChangePasswordDTO {
  password: string;
  confirmPassword: string;
}
