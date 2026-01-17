export interface Stock {
  id: number;
  productId: number;
  productName: string;
  lotNumber: string;
  quantity: number;
  entryDate: Date;
  expiryDate?: Date;
  fifoValue: number;
}

export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  type: 'entry' | 'exit';
  quantity: number;
  date: Date;
  reference: string;
}

