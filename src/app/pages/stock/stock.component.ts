import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { DataTableComponent, TableColumn } from '../../components/shared/data-table/data-table.component';
import {EtatGlobal, AlerteStock} from '../../models/stock.model';
import {StockService} from '../../services/stock.service';
import {ProductService} from '../../services/product.service';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {
  private stockService = inject(StockService);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  products: Product[]=[];
  etatGlobal: EtatGlobal[] = [];
  stockByProduit: any = null;
  alertes: AlerteStock[] = [];
  valorisation: string = '';
  loadingStock: boolean = false;

  stockColumns: TableColumn[] = [
    { key: 'reference', label: 'Référence', type: 'text' },
    { key: 'nom', label: 'Nom', type: 'text' },
    { key: 'categorie', label: 'Catégorie', type: 'text' },
    { key: 'quantiteDisponible', label: 'Quantité', type: 'number' },
    { key: 'valorisation', label: 'Valorisation (DH)', type: 'number' },
    { key: 'pointDeCommande', label: 'Point de Commande', type: 'number' },
    { key: 'enAlerte', label: 'Alerte', type: 'text' }
  ];

  ngOnInit(): void {
    this.getAllProducts();
    this.getEtatGlobal();
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
}
