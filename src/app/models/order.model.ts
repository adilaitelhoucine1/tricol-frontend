import {OrderItem} from './OrderItem.model';

export interface Order {
  id: number;
  orderNumber: string;
  supplierId: number;
  supplierName: string;
  date: Date;
  status: 'draft' | 'validated' | 'received' | 'cancelled';
  totalAmount: number;
  items: OrderItem[];
}


