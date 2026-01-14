import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, AuthResponse, UserRole } from '../../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);

  currentUser = this.currentUserSignal.asReadonly();
  token = this.tokenSignal.asReadonly();

  constructor() {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Client-side validation
    if (!credentials.username || !credentials.password) {
      return throwError(() => new Error('Username and password are required'));
    }

    // Real API call to Spring Boot backend
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response.token && response.user) {
          this.setAuthData(response.user, response.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    // Client-side validation
    if (!userData.username || !userData.email || !userData.password) {
      return throwError(() => new Error('All fields are required'));
    }

    if (userData.password !== userData.confirmPassword) {
      return throwError(() => new Error('Passwords do not match'));
    }

    if (userData.password.length < 6) {
      return throwError(() => new Error('Password must be at least 6 characters'));
    }

    // Prepare request body (remove confirmPassword as backend doesn't need it)
    const registerData = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role: userData.role
    };

    // Real API call to Spring Boot backend
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, registerData).pipe(
      tap(response => {
        if (response.token && response.user) {
          this.setAuthData(response.user, response.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.tokenSignal.set(null);
    localStorage.removeItem('tricol_user');
    localStorage.removeItem('tricol_token');
  }

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null && this.tokenSignal() !== null;
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUserSignal();
    return user?.role === role;
  }

  private setAuthData(user: User, token: string): void {
    this.currentUserSignal.set(user);
    this.tokenSignal.set(token);
    localStorage.setItem('tricol_user', JSON.stringify(user));
    localStorage.setItem('tricol_token', token);
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('tricol_user');
    const token = localStorage.getItem('tricol_token');

    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSignal.set(user);
        this.tokenSignal.set(token);
      } catch (error) {
        this.logout();
      }
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend error
      if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check your connection.';
      } else if (error.status === 401) {
        errorMessage = error.error?.message || 'Invalid credentials';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Invalid request data';
      } else if (error.status === 409) {
        errorMessage = error.error?.message || 'User already exists';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.error?.message || `Error: ${error.status}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}

