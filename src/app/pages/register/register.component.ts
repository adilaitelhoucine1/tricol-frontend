import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerData: RegisterRequest = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: UserRole.WAREHOUSE_KEEPER
  };

  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  roles = [
    { value: UserRole.ADMIN, label: 'Administrateur' },
    { value: UserRole.PURCHASING_MANAGER, label: 'Responsable Achats' },
    { value: UserRole.WAREHOUSE_KEEPER, label: 'Magasinier' },
    { value: UserRole.WORKSHOP_MANAGER, label: 'Chef d\'Atelier' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error.set(null);

    // Client-side validation
    if (!this.registerData.username || !this.registerData.email ||
        !this.registerData.password || !this.registerData.confirmPassword ||
        !this.registerData.firstName || !this.registerData.lastName) {
      this.error.set('Tous les champs sont requis');
      return;
    }

    if (this.registerData.username.length < 3 || this.registerData.username.length > 50) {
      this.error.set('Le nom d\'utilisateur doit contenir entre 3 et 50 caractères');
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.error.set('Les mots de passe ne correspondent pas');
      return;
    }

    if (this.registerData.password.length < 6) {
      this.error.set('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    this.loading.set(true);

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.loading.set(false);
        console.log('Registration successful:', response.message);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || 'Une erreur est survenue lors de l\'inscription');
      }
    });
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }
}

