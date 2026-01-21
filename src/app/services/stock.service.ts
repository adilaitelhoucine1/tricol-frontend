import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EtatGlobal, AlerteStock } from '../models/stock.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/v1/stock`;

  getEtatGlobal(): Observable<EtatGlobal[]> {
    return this.http.get<EtatGlobal[]>(`${this.apiUrl}`);
  }

  getStockByProduit(produitId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/produit/${produitId}`);
  }

  getAlertes(): Observable<AlerteStock[]> {
    return this.http.get<AlerteStock[]>(`${this.apiUrl}/alertes`);
  }

  getValorisation(): Observable<string> {
    return this.http.get(`${this.apiUrl}/valorisation`, { responseType: 'text' });
  }
}

