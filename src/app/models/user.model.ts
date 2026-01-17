export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole; // Keep for backward compatibility
  roles?: string[]; // Array of roles from backend
  permissions?: string[]; // Array of permissions from backend
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
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  accessToken?: string; // New backend structure
  refreshToken?: string; // New backend structure
  tokenType?: string | null;
  expiresIn?: number;
  token?: string; // Keep for backward compatibility
  message?: string;
}

