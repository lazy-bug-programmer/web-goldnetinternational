export interface StockTransaction {
  id?: string;
  stock_account_id: string;
  date: Date;
  type: StockTransactionType;
  description: string;
  amount: number;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export enum StockTransactionType {
  INCREASE,
  DECREASE,
}
