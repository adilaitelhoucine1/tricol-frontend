export interface User {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
  role?: Role;
  roles?: string[];
  permissions?: string[];
  customPermissions?: CustomPermission[];
  createdAt?: Date;
}

export interface CustomPermission {
  permissionId: number;
  permissionName: string;
  permissionCategory: string;
  granted: boolean;
  assignedAt: string;
  assignedBy: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  category?: string;
}

export interface AssignRoleRequest {
  roleName: string;
}

export interface UpdatePermissionRequest {
  permissionName: string;
  granted: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  confirmPassword?: string;
  role?: UserRole;
}

export interface AuthResponse {
  token: string;
  accessToken?: string;
  refreshToken?: string;
  user: User;
  message?: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  PURCHASING_MANAGER = 'PURCHASING_MANAGER',
  WAREHOUSE_KEEPER = 'WAREHOUSE_KEEPER',
  WORKSHOP_MANAGER = 'WORKSHOP_MANAGER'
}
