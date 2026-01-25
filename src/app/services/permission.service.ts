import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private authService = inject(AuthService);

  hasPermission(permission: string): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;

    return user.permissions?.includes(permission) || false;
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(p => this.hasPermission(p));
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(p => this.hasPermission(p));
  }
}
