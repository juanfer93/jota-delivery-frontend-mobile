export enum UserRole {
  ADMIN = 'ADMIN',
  DOMICILIARIO = 'DOMICILIARIO',
}

export interface User {
  id: string;  
  nombre: string;
  email: string;  
  rol: UserRole;
  codigo?: string;
  saldo?: number;
  bloqueado?: boolean;
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
