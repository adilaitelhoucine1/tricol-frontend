export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  token?: string;
}

export enum UserRole {
  ADMIN = 'ADMINISTRATEUR',
  PURCHASING_MANAGER = 'RESPONSABLE_ACHATS',
  WAREHOUSE_KEEPER = 'MAGASINIER',
  WORKSHOP_MANAGER = 'CHEF_ATELIER'
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

