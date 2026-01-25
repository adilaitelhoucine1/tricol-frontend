import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, Role, AssignRoleRequest, UpdatePermissionRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/v1/admin/users`;

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  enableUser(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/enable`, {});
  }

  disableUser(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/disable`, {});
  }

  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }

  assignRoleToUser(userId: number, request: AssignRoleRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/role`, request);
  }

  removeRoleFromUser(userId: number): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/${userId}/role`);
  }

  updateUserPermission(userId: number, request: UpdatePermissionRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/permissions`, request);
  }
}
