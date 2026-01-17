export interface ExitVoucher {
  id: number;
  voucherNumber: string;
  date: Date;
  requestedBy: string;
  status: 'draft' | 'validated' | 'cancelled';
  items: ExitItem[];
}

export interface ExitItem {
  productId: number;
  productName: string;
  quantity: number;
  lotNumber: string;
}

