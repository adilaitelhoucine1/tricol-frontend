import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AuthService} from '../../services/auth.service';
import {PermissionService} from '../../services/permission.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);

  @Input() sidebarOpen: boolean = true;
  @Input() activeSection: string = 'suppliers';
  @Output() sectionChange = new EventEmitter<string>();
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() logoutEvent = new EventEmitter<void>();

  canViewSuppliers = () => this.permissionService.hasPermission('CONSULTER_FOURNISSEUR');
  canViewProducts = () => this.permissionService.hasPermission('CONSULTER_PRODUIT');
  canViewOrders = () => this.permissionService.hasPermission('CONSULTER_COMMANDE');
  canViewStock = () => this.permissionService.hasPermission('CONSULTER_STOCK');
  canManageUsers = () => this.permissionService.hasPermission('GERER_UTILISATEURS');

  setActiveSection(section: string): void {
    this.sectionChange.emit(section);
  }

  logout(): void {
    this.logoutEvent.emit();
  }
}
