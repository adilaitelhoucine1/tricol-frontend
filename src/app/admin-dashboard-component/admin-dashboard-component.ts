import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AuthService} from '../services/auth.service';
import {SidebarComponent} from '../components/sidebar/sidebar.component';
import {SuppliersComponent} from '../pages/suppliers/suppliers.component';
import {ProductsComponent} from '../pages/products/products.component';
import {OrdersComponent} from '../pages/orders/orders.component';
import {StockComponent} from '../pages/stock/stock.component';
import {UsersComponent} from '../pages/users/users.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, SuppliersComponent, ProductsComponent, OrdersComponent, StockComponent, UsersComponent],
  templateUrl: './admin-dashboard-component.html',
  styleUrls: ['./admin-dashboard-component.css']
})
export class AdminDashboardComponent {
   private authService = inject(AuthService);

  sidebarOpen: boolean = true;
  activeSection: string = 'suppliers';

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  getPageTitle(): string {
    const titles: { [key: string]: string } = {
      'suppliers': 'Fournisseurs',
      'products': 'Produits',
      'orders': 'Commandes Fournisseurs',
      'stock': 'Gestion de Stock',
      'users': 'Gestion des Utilisateurs'
    };
    return titles[this.activeSection] || 'Dashboard';
  }

  logout(): void {
    this.authService.logout();
  }
}
