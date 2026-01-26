import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../../models/product.model';
import { DataTableComponent, TableColumn, TableAction } from '../../components/shared/data-table/data-table.component';
import {OrderService} from '../../services/order.service';
import {Order} from '../../models/order.model';
import {OrderItem} from '../../models/OrderItem.model';
import {PermissionService} from '../../services/permission.service';
import {SupplierService} from '../../services/supplier.service';
import {SupplierModal} from '../../models/supplier.modal';
import {ProductService} from '../../services/product.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private supplierService = inject(SupplierService);
  private productService = inject(ProductService);
  private permissionService = inject(PermissionService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  canCreateOrder = () => this.permissionService.hasPermission('CREER_COMMANDE');
  canValidateOrder = () => this.permissionService.hasPermission('VALIDER_COMMANDE');
  canCancelOrder = () => this.permissionService.hasPermission('ANNULER_COMMANDE');
  canReceiveOrder = () => this.permissionService.hasPermission('RECEPTIONNER_COMMANDE');

  orders:Order[]=[];
  orderItems:OrderItem[]=[];
  suppliers: SupplierModal[] = [];
  products: Product[]=[];
  loadingOrders: boolean = false;

  showModal: boolean = false;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  currentOrderId?: number;

  orderForm!: FormGroup;

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
    this.getAllOrders();
    this.getAllSuppliers();
    this.getAllProducts();
  }

  initializeForm(): void {
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

  getAllSuppliers(): void {
    this.supplierService.getAll().subscribe({
      next: (data) => {
        this.suppliers = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des fournisseurs:', err);
      }
    });
  }

  getAllProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des produits:', err);
      }
    });
  }

  addOrder(): void {
    if (!this.orderForm) this.initializeForm();
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

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.currentOrderId = undefined;
    this.orderItems = [];
    this.orderForm?.reset();
  }

  onOrderRowClick(order: any): void {
    console.log('Order clicked:', order);
  }
}
