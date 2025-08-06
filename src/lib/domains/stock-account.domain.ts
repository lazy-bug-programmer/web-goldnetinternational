export interface StockAccount {
  id?: string;
  // Random Generated 7 character alphanumeric string
  client_code: string;

  // Random Generated 4 character alphanumeric string
  remister_code: string;

  // Random Generated character numeric string with format XXX-XXX-XXXXXXXXX
  cds_no: string;

  cds_id: string;
  user_id: string; // Firebase Auth user ID
  type: StockAccountType;
  status: StockAccountStatus;
  capital: number;
  profit: number;
  estimated_total: number;
  estimated_total_time: number;
  last_transaction_date: Date;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export enum StockAccountStatus {
  ACTIVE,
  INACTIVE,
  PENDING,
  CLOSED,
}

export enum StockAccountType {
  BASIC,
  PREMIUM,
  BUSINESS,
  INVESTOR,
}
