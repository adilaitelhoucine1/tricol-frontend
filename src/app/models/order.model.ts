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

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

