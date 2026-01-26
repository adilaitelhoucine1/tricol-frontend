import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableComponent, TableColumn, TableAction } from '../../components/shared/data-table/data-table.component';
import {User, Role} from '../../models/user.model';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  users: User[] = [];
  roles: Role[] = [];
  currentUser?: User;
  loadingUsers: boolean = false;

  showModal: boolean = false;
  modalType: 'user' | 'permission' = 'user';
  isSubmitting: boolean = false;
  currentUserId?: number;

  userRoleForm!: FormGroup;
  permissionForm!: FormGroup;
  availablePermissions: any[] = [];

  userColumns: TableColumn[] = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'username', label: 'Username', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'role.name', label: 'Rôle', type: 'text' },
    {
      key: 'permissions',
      label: 'Permissions',
      type: 'text',
      format: (value: any, row: User) => this.formatPermissions(row)
    },
    { key: 'enabled', label: 'Statut', type: 'text' }
  ];

  userActions: TableAction[] = [
    {
      label: 'Activer/Désactiver',
      class: 'btn-toggle',
      icon: '🔄',
      onClick: (user) => this.toggleUserStatus(user)
    },
    {
      label: 'Assigner Rôle',
      class: 'btn-edit',
      icon: '👤',
      onClick: (user) => this.openAssignRoleModal(user)
    },
    {
      label: 'Gérer Permissions',
      class: 'btn-edit',
      icon: '🔐',
      onClick: (user) => this.openPermissionModal(user)
    },
    {
      label: 'Supprimer',
      class: 'btn-delete',
      icon: '🗑️',
      onClick: (user) => this.deleteUser(user.id)
    }
  ];

  ngOnInit(): void {
    this.initializeForms();
    this.getAllUsers();
    this.getAllRoles();
  }

  initializeForms(): void {
    this.userRoleForm = this.fb.group({
      roleName: ['', [Validators.required]]
    });

    this.permissionForm = this.fb.group({
      permissionName: ['', [Validators.required]],
      granted: [true, [Validators.required]]
    });
  }

  getAllUsers(): void {
    this.loadingUsers = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loadAvailablePermissions(data);
        this.loadingUsers = false;
        this.cdr.detectChanges();

      },
      error: (err) => {
        this.loadingUsers = false;
        console.error('Erreur lors du chargement des utilisateurs:', err);
      }
    });
  }

  loadAvailablePermissions(users: User[]): void {
    const permissionsSet = new Set<any>();
    users.forEach(user => {
      if (user.role?.permissions) {
        user.role.permissions.forEach(p => {
          permissionsSet.add(JSON.stringify({ id: p.id, name: p.name, category: p.category }));
          console.log("*******" , permissionsSet);
        });
      }
    });
    this.availablePermissions = Array.from(permissionsSet).map(p => JSON.parse(p));
  }

  formatPermissions(user: User): string {
    const rolePerms = user.role?.permissions?.map(p => p.name) || [];
    const customPerms = user.customPermissions || [];
    const revokedPerms = customPerms.filter((cp: any) => !cp.granted).map((cp: any) => cp.permissionName);
    const grantedPerms = customPerms.filter((cp: any) => cp.granted).map((cp: any) => cp.permissionName);

    const effectivePerms = [...rolePerms.filter(p => !revokedPerms.includes(p)), ...grantedPerms];
    return effectivePerms.length > 0 ? `${effectivePerms.length} permissions` : 'Aucune';
  }

  getAllRoles(): void {
    this.userService.getAllRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur lors du chargement des rôles:', err)
    });
  }

  toggleUserStatus(user: User): void {
    if (user.enabled) {
      this.userService.disableUser(user.id).subscribe({
        next: () => {
          this.getAllUsers();
          alert('Utilisateur désactivé avec succès');
        },
        error: (err) => alert('Erreur lors de la désactivation')
      });
    } else {
      this.userService.enableUser(user.id).subscribe({
        next: () => {
          this.getAllUsers();
          alert('Utilisateur activé avec succès');
        },
        error: (err) => alert('Erreur lors de l\'activation')
      });
    }
  }

  openAssignRoleModal(user: User): void {
    this.modalType = 'user';
    this.currentUserId = user.id;
    this.userRoleForm.reset();
    this.showModal = true;
  }

  assignRole(): void {
    if (this.userRoleForm.invalid || !this.currentUserId) return;

    this.isSubmitting = true;
    this.userService.assignRoleToUser(this.currentUserId, this.userRoleForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeModal();
        this.getAllUsers();
        alert('Rôle assigné avec succès');
      },
      error: (err) => {
        this.isSubmitting = false;
        alert('Erreur lors de l\'assignation du rôle');
      }
    });
  }

  openPermissionModal(user: User): void {
    this.modalType = 'permission';
    this.currentUserId = user.id;
    this.currentUser = user;
    this.permissionForm.reset({ granted: true });
    this.showModal = true;
  }

  updatePermission(): void {
    if (this.permissionForm.invalid || !this.currentUserId) return;

    this.isSubmitting = true;
    this.userService.updateUserPermission(this.currentUserId, this.permissionForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeModal();
        this.getAllUsers();
        alert('Permission mise à jour avec succès');
      },
      error: (err) => {
        this.isSubmitting = false;
        alert('Erreur lors de la mise à jour de la permission');
      }
    });
  }

  deleteUser(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.getAllUsers();
          alert('Utilisateur supprimé avec succès');
        },
        error: (err) => alert('Erreur lors de la suppression')
      });
    }
  }

  getUserPermissions(): any[] {
    if (!this.currentUser) return [];

    const rolePerms = this.currentUser.role?.permissions || [];
    const customPerms = this.currentUser.customPermissions || [];

    const allPerms = rolePerms.map(p => {
      const custom = customPerms.find((cp: any) => cp.permissionName === p.name);
      return {
        ...p,
        fromRole: true,
        granted: custom ? custom.granted : true,
        hasCustom: !!custom
      };
    });

    const customOnlyPerms = customPerms
      .filter((cp: any) => cp.granted && !rolePerms.find(p => p.name === cp.permissionName))
      .map((cp: any) => ({
        id: cp.permissionId,
        name: cp.permissionName,
        category: cp.permissionCategory,
        description: '',
        fromRole: false,
        granted: true,
        hasCustom: true
      }));

    return [...allPerms, ...customOnlyPerms];
  }

  closeModal(): void {
    this.showModal = false;
    this.currentUserId = undefined;
    this.userRoleForm?.reset();
  }
}
