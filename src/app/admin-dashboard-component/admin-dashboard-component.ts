import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupplierService } from '../services/supplier.service';
import { SupplierModal } from '../models/supplier.modal';
import { Product } from '../models/product.model';
import { DataTableComponent, TableColumn, TableAction } from '../components/shared/data-table/data-table.component';
import {ProductService} from '../services/product.service';
import {AuthService} from '../services/auth.service';
import {OrderService} from '../services/order.service';
import {Order} from '../models/order.model';
import {OrderItem} from '../models/OrderItem.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent],
  templateUrl: './admin-dashboard-component.html',
  styleUrls: ['./admin-dashboard-component.css']
})
export class AdminDashboardComponent implements OnInit {
   private supplierService = inject(SupplierService);
   private authService = inject(AuthService);
   private productService=inject(ProductService);
   private orderService = inject(OrderService);
   private cdr = inject(ChangeDetectorRef);
   private fb = inject(FormBuilder);


   suppliers: SupplierModal[] = [];
   products: Product[]=[];
   orders:Order[]=[];
   orderItems:OrderItem[]=[];

   loadingSuppliers: boolean = false;
   loadingProducts: boolean = false;
   loadingOrders: boolean = false;

   sidebarOpen: boolean = true;
  activeSection: string = 'suppliers';

  showModal: boolean = false;
  modalType: 'supplier' | 'product' | 'order' = 'supplier';
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  currentSupplierId?: number;
  currentProductId?: number;
  currentOrderId?: number;

  supplierForm!: FormGroup;
  productForm!: FormGroup;
  orderForm!: FormGroup;
  orderItemForm!: FormGroup;


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

  orderColumns: TableColumn[] = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'numeroCommande', label: 'N° Commande', type: 'text' },
    { key: 'fournisseur', label: 'Fournisseur', type: 'text' },
    { key: 'dateCommande', label: 'Date', type: 'text' },
    { key: 'statut', label: 'Statut', type: 'text' },
    { key: 'montantTotal', label: 'Montant', type: 'number' }
  ];

  orderActions: TableAction[] = [

    {
      label: 'Recevoir',
      class: 'btn-receive',
      icon: '📦',
      onClick: (order) => this.receiveOrder(order.id)
    },
    {
      label: 'Valider',
      class: 'btn-validate',
      icon: '✓',
      onClick: (order) => this.validateOrder(order.id)
    },
    {
      label: 'Annuler',
      class: 'btn-cancel',
      icon: '✗',
      onClick: (order) => this.cancelOrder(order.id)
    },
    {
      label: 'Supprimer',
      class: 'btn-delete',
      icon: '🗑️',
      onClick: (order) => this.deleteOrder(order.id)
    }
  ];

   ngOnInit(): void {
    this.initializeForm();
    this.getAllSuppliers();
    this.getAllProducts();
    this.getAllOrders();
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

    this.orderForm = this.fb.group({
      numeroCommande: ['', [Validators.required, Validators.maxLength(50)]],
      fournisseurId: ['', [Validators.required]],
      dateCommande: ['', [Validators.required]],
      observations: ['', [Validators.maxLength(1000)]]
    });

    this.orderForm = this.fb.group({
      numeroCommande: ['', [Validators.required]],
      fournisseurId: ['', [Validators.required]],
      dateCommande: ['', [Validators.required]],
      observations: [''],
      produitId: ['', [Validators.required]],
      quantite: [0, [Validators.required, Validators.min(1)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]]
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
    this.modalType = 'supplier';
    this.isEditMode = false;
    this.currentSupplierId = undefined;
    this.supplierForm.reset();
    this.showModal = true;
  }

  editSupplier(supplier: SupplierModal): void {
    this.modalType = 'supplier';
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
    this.currentProductId = undefined;
    this.currentOrderId = undefined;
    this.orderItems = [];
    this.supplierForm?.reset();
    this.productForm?.reset();
    this.orderForm?.reset();
    this.orderItemForm?.reset();
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
    this.modalType = 'product';
    this.isEditMode = false;
    this.currentProductId = undefined;
    this.productForm.reset();
    this.showModal = true;
  }

  editProduct(product: Product): void {
    this.modalType = 'product';
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

          this.setActiveSection("products");
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

  onProductRowClick(product: Product): void {
    console.log('Product clicked:', product);
  }
  onSupplierRowClick(product: Product): void {
    console.log('supplier clicked:', product);
  }

  getAllOrders(): void {
    this.orderService.getAll().subscribe({
      next:(data)=>{
        this.orders=data;
      },
      error(error){
        console.log("error");
      }
    })
  }

  addOrder(): void {
    if (!this.orderForm) this.initializeForm();
    this.modalType = 'order';
    this.isEditMode = false;
    this.currentOrderId = undefined;
    this.orderForm.reset();
    this.showModal = true;
  }

  editOrder(order: any): void {
  }

  deleteOrder(id: number): void {
    if (confirm("Etes vous sur de supprimer cette commade  ")){
      this.orderService.delete(id).subscribe({
        next:()=>{
          this.getAllOrders();
          this.activeSection="order";
        },
        error(error){
          alert(error);
        }
      })
    }
  }


  submitOrder(): void {
    if (this.orderForm.invalid) return;

    const formValue = this.orderForm.value;
    const product = this.products.find(p => p.id === +formValue.produitId);

    const sousTotal = +formValue.quantite * +formValue.prixUnitaire;

    this.orderItems.push({
      produitId: +formValue.produitId,
      produitNom: product?.nom || '',
      produitReference: product?.reference || '',
      quantite: +formValue.quantite,
      prixUnitaire: +formValue.prixUnitaire,
      sousTotal: sousTotal
    });

    const orderData = {
      numeroCommande: formValue.numeroCommande,
      fournisseurId: +formValue.fournisseurId,
      dateCommande: formValue.dateCommande,
      observations: formValue.observations,
      lignesCommande: this.orderItems
    };

    this.orderService.create(orderData as any).subscribe({
      next: () => {
        this.closeModal();
        this.getAllOrders();
        this.activeSection="orders";
        // alert('Commande créée avec succès');
      },
      error: (error) => {
        console.error(error);
        alert('Erreur lors de la création');
      }
    });
  }


  receiveOrder(id: number): void {

    const now = new Date();

     const dateReception = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    ).toISOString().slice(0, 19);

    if (!dateReception) return;

    const observations = prompt("Observations (optionnel):") || '';

    this.orderService.receive(id,{dateReception,observations}).subscribe({
         next:()=>{
           this.getAllOrders();
           this.setActiveSection("orders");
           alert("done");
         },
         error(error){
           alert(error.error.Erreur);
         }

       })

  }

  validateOrder(id: number): void {
     if (confirm("Etes vous sur de valider cette Commade")){
       this.orderService.valider(id).subscribe({
         next:()=>{
           alert("commande valide avec sucees");
         },
         error(error){
           alert(error.error.Erreur);
         }
       })
     }

  }

  cancelOrder(id: number): void {
    if (confirm("Etes vous sur d annuler  cette Commade")){
      this.orderService.cancel(id).subscribe({
        next:()=>{
          alert("commande anulle avec sucees");
          this.getAllOrders();
        },
        error(error){
          alert(error.error.Erreur);
        }
      })
    }
  }

  onOrderRowClick(order: any): void {
    console.log('Order clicked:', order);
  }



   toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  logout(): void {
    this.authService.logout();
  }
}
