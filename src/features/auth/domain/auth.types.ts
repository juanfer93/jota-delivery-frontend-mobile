export enum UserRole {
  ADMIN = 'ADMIN',
  DOMICILIARIO = 'DOMICILIARIO',
}

export interface User {
  id: number; 
  nombre: string;
  correo: string;
  rol: UserRole;
  telefono?: string;
  estado: boolean; 
  vehiculo?: string;
  placa?: string;
  createdAt: string; 
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}