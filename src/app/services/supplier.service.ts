import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SupplierModal } from '../models/supplier.modal';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/v1/fournisseurs`;

  constructor() {
  }

  getAll(): Observable<SupplierModal[]> {
    return this.http.get<SupplierModal[]>(this.apiUrl);
  }

  getById(id: number): Observable<SupplierModal> {
    return this.http.get<SupplierModal>(`${this.apiUrl}/${id}`);
  }

  create(supplier: Omit<SupplierModal, 'id'>): Observable<SupplierModal> {
    return this.http.post<SupplierModal>(this.apiUrl, supplier);
  }

  update(id: number, supplier: Partial<SupplierModal>): Observable<SupplierModal> {
    return this.http.put<SupplierModal>(`${this.apiUrl}/${id}`, supplier);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

