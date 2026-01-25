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
import {EtatGlobal, AlerteStock} from '../models/stock.model';
import {StockService} from '../services/stock.service';
import {User, Role} from '../models/user.model';
import {UserService} from '../services/user.service';
import {PermissionService} from '../services/permission.service';



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
   private stockService = inject(StockService);
   private userService = inject(UserService);
   private permissionService = inject(PermissionService);

  private cdr = inject(ChangeDetectorRef);
   private fb = inject(FormBuilder);


  canViewSuppliers = () => this.permissionService.hasPermission('CONSULTER_FOURNISSEUR');
  canCreateSupplier = () => this.permissionService.hasPermission('CREER_FOURNISSEUR');
  canModifySupplier = () => this.permissionService.hasPermission('MODIFIER_FOURNISSEUR');
  canDeleteSupplier = () => this.permissionService.hasPermission('SUPPRIMER_FOURNISSEUR');

  canViewProducts = () => this.permissionService.hasPermission('CONSULTER_PRODUIT');
  canCreateProduct = () => this.permissionService.hasPermission('CREER_PRODUIT');
  canModifyProduct = () => this.permissionService.hasPermission('MODIFIER_PRODUIT');
  canDeleteProduct = () => this.permissionService.hasPermission('SUPPRIMER_PRODUIT');

  canViewOrders = () => this.permissionService.hasPermission('CONSULTER_COMMANDE');
  canCreateOrder = () => this.permissionService.hasPermission('CREER_COMMANDE');
  canValidateOrder = () => this.permissionService.hasPermission('VALIDER_COMMANDE');
  canCancelOrder = () => this.permissionService.hasPermission('ANNULER_COMMANDE');
  canReceiveOrder = () => this.permissionService.hasPermission('RECEPTIONNER_COMMANDE');

  canViewStock = () => this.permissionService.hasPermission('CONSULTER_STOCK');
  canManageUsers = () => this.permissionService.hasPermission('GERER_UTILISATEURS');



  suppliers: SupplierModal[] = [];
   products: Product[]=[];
   orders:Order[]=[];
   orderItems:OrderItem[]=[];
   etatGlobal: EtatGlobal[] = [];
   stockByProduit: any = null;
   alertes: AlerteStock[] = [];
   valorisation: string = '';
   users: User[] = [];
   roles: Role[] = [];
   currentUser?: User;

   loadingSuppliers: boolean = false;
   loadingProducts: boolean = false;
   loadingOrders: boolean = false;
   loadingStock: boolean = false;
   loadingUsers: boolean = false;

   sidebarOpen: boolean = true;
  activeSection: string = 'suppliers';

  showModal: boolean = false;
  modalType: 'supplier' | 'product' | 'order' | 'user' | 'permission' = 'supplier';
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  currentSupplierId?: number;
  currentProductId?: number;
  currentOrderId?: number;
  currentUserId?: number;

  supplierForm!: FormGroup;
  productForm!: FormGroup;
  orderForm!: FormGroup;
  orderItemForm!: FormGroup;
  userRoleForm!: FormGroup;
  permissionForm!: FormGroup;
  availablePermissions: any[] = [];


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

  stockColumns: TableColumn[] = [
    { key: 'reference', label: 'Référence', type: 'text' },
    { key: 'nom', label: 'Nom', type: 'text' },
    { key: 'categorie', label: 'Catégorie', type: 'text' },
    { key: 'quantiteDisponible', label: 'Quantité', type: 'number' },
    { key: 'valorisation', label: 'Valorisation (DH)', type: 'number' },
    { key: 'pointDeCommande', label: 'Point de Commande', type: 'number' },
    { key: 'enAlerte', label: 'Alerte', type: 'text' }
  ];

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
    this.initializeForm();
    this.getAllSuppliers();
    this.getAllProducts();
    this.getAllOrders();
    this.getAllRoles();
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

    this.userRoleForm = this.fb.group({
      roleName: ['', [Validators.required]]
    });

    this.permissionForm = this.fb.group({
      permissionName: ['', [Validators.required]],
      granted: [true, [Validators.required]]
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
    this.currentUserId = undefined;
    this.orderItems = [];
    this.supplierForm?.reset();
    this.productForm?.reset();
    this.orderForm?.reset();
    this.orderItemForm?.reset();
    this.userRoleForm?.reset();
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
        console.log(error);
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
        this.activeSection="orders";
        this.getAllOrders();
        this.cdr.detectChanges();

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
           this.getAllOrders();

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
          this.getAllOrders();

          alert("commande anulle avec sucees");
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

  getEtatGlobal(): void {
    this.loadingStock = true;
    this.stockService.getEtatGlobal().subscribe({
      next: (data) => {
        this.etatGlobal = data;
        this.loadingStock = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingStock = false;
        console.error('Erreur lors du chargement de l\'état global:', err);
      }
    });
  }

  getStockByProduit(produitId: number): void {
    if (!produitId) return;
    this.stockService.getStockByProduit(produitId).subscribe({
      next: (data) => {
        this.stockByProduit = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur lors du chargement du stock:', err)
    });
  }

  getAlertes(): void {
    this.stockService.getAlertes().subscribe({
      next: (data) => {
        this.alertes = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur lors du chargement des alertes:', err)
    });
  }

  getValorisation(): void {
    this.stockService.getValorisation().subscribe({
      next: (data) => {
        this.valorisation = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur lors du chargement de la valorisation:', err)
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
