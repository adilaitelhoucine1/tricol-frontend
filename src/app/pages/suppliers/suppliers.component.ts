import { Component, OnInit, inject, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupplierService } from '../../services/supplier.service';
import { SupplierModal } from '../../models/supplier.modal';
import { DataTableComponent, TableColumn, TableAction } from '../../components/shared/data-table/data-table.component';
import {PermissionService} from '../../services/permission.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent],
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.css']
})
export class SuppliersComponent implements OnInit {
  private supplierService = inject(SupplierService);
  private permissionService = inject(PermissionService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  canCreateSupplier = () => this.permissionService.hasPermission('CREER_FOURNISSEUR');
  canModifySupplier = () => this.permissionService.hasPermission('MODIFIER_FOURNISSEUR');
  canDeleteSupplier = () => this.permissionService.hasPermission('SUPPRIMER_FOURNISSEUR');

  suppliers: SupplierModal[] = [];
  loadingSuppliers: boolean = false;

  showModal: boolean = false;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  currentSupplierId?: number;

  supplierForm!: FormGroup;

  supplierColumns: TableColumn[] = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'raisonSociale', label: 'Raison Sociale', type: 'text' },
    { key: 'personneContact', label: 'Personne Contact', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'telephone', label: 'Téléphone', type: 'text' },
    { key: 'adresse', label: 'Adresse', type: 'text' },
    { key: 'ville', label: 'Ville', type: 'text' },
    { key: 'ice', label: 'ICE', type: 'text' }
  ];

  supplierActions: TableAction[] = [
    {
      label: 'Modifier',
      class: 'btn-edit',
      icon: '✏️',
      onClick: (supplier) => this.editSupplier(supplier)
    },
    {
      label: 'Supprimer',
      class: 'btn-delete',
      icon: '🗑️',
      onClick: (supplier) => this.deleteSupplier(supplier.id)
    }
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.getAllSuppliers();
  }

  initializeForm(): void {
    this.supplierForm = this.fb.group({
      raisonSociale: ['', [Validators.required, Validators.maxLength(200)]],
      adresse: ['', [Validators.required]],
      ville: ['', [Validators.required, Validators.maxLength(100)]],
      personneContact: ['', [Validators.required, Validators.maxLength(150)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]],
      ice: ['', [Validators.required, Validators.minLength(15), Validators.maxLength(15)]]
    });
  }

  getAllSuppliers(): void {
    this.loadingSuppliers = true;

    this.supplierService.getAll().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.loadingSuppliers = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingSuppliers = false;
        this.cdr.detectChanges();

        let errorMessage = 'Erreur lors du chargement des fournisseurs';

        if (err.status === 0) {
          errorMessage = ' Impossible de se connecter au serveur.\nVérifiez que votre backend Spring Boot est démarré sur le port 8087.';
        } else if (err.status === 404) {
          errorMessage = ' Endpoint introuvable (404).\nVérifiez que la route /api/v1/fournisseurs existe dans votre backend.';
        } else if (err.status === 401) {
          errorMessage = ' Non autorisé (401).\nProblème d\'authentification.';
        } else if (err.status === 500) {
          errorMessage = 'Erreur serveur (500).\nVérifiez les logs de votre backend Spring Boot.';
        }

        alert(errorMessage);
      }
    });
  }

  addSupplier(): void {
    this.isEditMode = false;
    this.currentSupplierId = undefined;
    this.supplierForm.reset();
    this.showModal = true;
  }

  editSupplier(supplier: SupplierModal): void {
    this.isEditMode = true;
    this.currentSupplierId = supplier.id;
    this.supplierForm.patchValue({
      raisonSociale: supplier.raisonSociale,
      adresse: supplier.adresse,
      ville: supplier.ville,
      personneContact: supplier.personneContact,
      email: supplier.email,
      telephone: supplier.telephone,
      ice: supplier.ice
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.currentSupplierId = undefined;
    this.supplierForm?.reset();
  }

  submitSupplier(): void {
    if (this.supplierForm.invalid) {
      Object.keys(this.supplierForm.controls).forEach(key => {
        this.supplierForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const supplierData = this.supplierForm.value;

    if (this.isEditMode && this.currentSupplierId) {
      this.supplierService.update(this.currentSupplierId, supplierData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeModal();
          this.getAllSuppliers();
          this.cdr.detectChanges();

          },
        error: (err) => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
          console.error('Erreur lors de la modification:', err);
        }
      });
    } else {
      this.supplierService.create(supplierData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeModal();
          this.getAllSuppliers();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
          alert(' Erreur lors ajout du fournisseur');
        }
      });
    }
  }

  deleteSupplier(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      this.supplierService.delete(id).subscribe({
        next: () => {
          this.getAllSuppliers();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          alert(' Erreur lors de la suppression du fournisseur');
        }
      });
    }
  }

  onSupplierRowClick(product: SupplierModal): void {
    console.log('supplier clicked:', product);
  }
}
