import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard, guestGuard } from './guards/auth.guard';
import {AdminDashboardComponent} from './admin-dashboard-component/admin-dashboard-component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path:'admin-dashboard',
    component:AdminDashboardComponent,
    canActivate: [authGuard]

  },
  {
    path: '**',
    redirectTo: ''
  }
];
