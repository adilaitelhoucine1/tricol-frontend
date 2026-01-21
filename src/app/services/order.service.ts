import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {Order} from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/v1/commandes`;

  constructor() {
  }

  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  create(order: Omit<Order, 'id'>): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }
  receive(id: number, data: { dateReception: string, observations?: string }): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/reception`, data);
  }

  valider(id: number): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/valider`,{});
  }

  cancel(id: number): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/annuler`,{});
  }

  update(id: number, order: Partial<Order>): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}`, order);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


}
