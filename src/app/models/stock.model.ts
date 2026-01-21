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

export interface EtatGlobal {
  produitId: number;
  reference: string;
  nom: string;
  categorie: string;
  quantiteDisponible: number;
  valorisation: number;
  pointDeCommande: number;
  enAlerte: boolean;
}

export interface AlerteStock {
  produitId: number;
  reference: string;
  nom: string;
  categorie: string;
  stockActuel: number;
  pointDeCommande: number;
  manquant: number;
}

