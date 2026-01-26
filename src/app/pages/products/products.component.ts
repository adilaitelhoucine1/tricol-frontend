import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../../models/product.model';
import { DataTableComponent, TableColumn, TableAction } from '../../components/shared/data-table/data-table.component';
import {ProductService} from '../../services/product.service';
import {PermissionService} from '../../services/permission.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  private productService=inject(ProductService);
  private permissionService = inject(PermissionService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  canCreateProduct = () => this.permissionService.hasPermission('CREER_PRODUIT');
  canModifyProduct = () => this.permissionService.hasPermission('MODIFIER_PRODUIT');
  canDeleteProduct = () => this.permissionService.hasPermission('SUPPRIMER_PRODUIT');

  products: Product[]=[];
  loadingProducts: boolean = false;

  showModal: boolean = false;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  currentProductId?: number;

  productForm!: FormGroup;

  productColumns: TableColumn[] = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'nom', label: 'Nom', type: 'text' },
    { key: 'reference', label: 'Référence', type: 'text' },
    { key: 'prixUnitaire', label: 'Catégorie', type: 'text' },
    { key: 'stockActuel', label: 'Stock Actuel', type: 'number' }
    ];

  productActions: TableAction[] = [
    {
      label: 'Modifier',
      class: 'btn-edit',
      icon: '✏️',
      onClick: (product) => this.editProduct(product)
    },
    {
      label: 'Supprimer',
      class: 'btn-delete',
      icon: '🗑️',
      onClick: (product) => this.deleteProduct(product.id)
    }
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.getAllProducts();
  }

  initializeForm(): void {
    this.productForm = this.fb.group({
      reference: ['', [Validators.required, Validators.maxLength(50)]],
      nom: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]],
      categorie: ['', [Validators.required]],
      stockInitial: [0, [Validators.required, Validators.min(0)]],
      pointDeCommande: [0, [Validators.required, Validators.min(0)]],
      uniteMesure: ['', [Validators.required]]
    });
  }

  getAllProducts(): void {
    this.loadingProducts = true;

    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.loadingProducts = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingProducts = false;
        this.cdr.detectChanges();
        console.error('Erreur lors du chargement des produits:', err);
      }
    });
  }

  addProduct(): void {
    if (!this.productForm) this.initializeForm();
    this.isEditMode = false;
    this.currentProductId = undefined;
    this.productForm.reset();
    this.showModal = true;
  }

  editProduct(product: Product): void {
    this.isEditMode = true;
    this.currentProductId = product.id;
    this.productForm.patchValue({
      reference: product.reference,
      nom: product.nom,
      description: product.description,
      prixUnitaire: product.prixUnitaire,
      categorie: product.categorie,
      stockInitial: product.stockInitial,
      pointDeCommande: product.pointDeCommande,
      uniteMesure: product.uniteMesure
    });
    this.showModal = true;
  }

  deleteProduct(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.productService.delete(id).subscribe({
        next: () => {
          this.getAllProducts();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
        }
      });
    }
  }

  submitProduct(): void {
    if (this.productForm.invalid) {
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const productData = this.productForm.value;

    if (this.isEditMode && this.currentProductId) {
      this.productService.update(this.currentProductId, productData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeModal();
          this.getAllProducts();
          this.cdr.detectChanges();
          alert(' Produit modifié avec succès');
        },
        error: (err) => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
          console.error('Erreur lors de la modification:', err);
          alert(' Erreur lors de la modification du produit');
        }
      });
    } else {
      this.productService.create(productData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeModal();
          this.getAllProducts();
          this.cdr.detectChanges();
          alert(' Produit ajouté avec succès');
        },
        error: (error) => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
          console.error('Erreur lors de la création:', error);
          alert(' Erreur lors de l\'ajout du produit');
        }
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.currentProductId = undefined;
    this.productForm?.reset();
  }

  onProductRowClick(product: Product): void {
    console.log('Product clicked:', product);
  }
}
