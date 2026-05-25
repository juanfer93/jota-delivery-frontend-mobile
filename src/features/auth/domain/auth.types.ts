export enum UserRole {
    ADMIN = 'admin',
    DOMICILIARIO = 'domiciliario',
    COMERCIO = 'comercio',
  }
  
  export interface User {
    id: string;
    nombre: string;
    email: string;
    rol: UserRole;
  }
  
  export interface LoginResponse {
    user: User;
    token: string;
  }