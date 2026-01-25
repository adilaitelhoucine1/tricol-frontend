import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData: LoginRequest = {
    username: '',
    password: ''
  };

  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error.set(null);
    this.loading.set(true);

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.loading.set(false);
        console.log('Login successful:', response.message);


        const userRole = response.user?.roles || response.user?.role;
        if (Array.isArray(userRole) && userRole.includes("ADMIN")) {
          console.log("Navigating to admin dashboard, role:", userRole);
          this.router.navigate(['/admin-dashboard']);
        } else if (userRole && !Array.isArray(userRole) && 'name' in userRole && userRole.name === 'ADMIN') {
          console.log("Navigating to admin dashboard, role:", userRole);
          this.router.navigate(['/admin-dashboard']);
        } else {
          console.log("Navigating to user dashboard, role:", userRole);
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || 'Une erreur est survenue lors de la connexion');
      }
    });
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }
}

