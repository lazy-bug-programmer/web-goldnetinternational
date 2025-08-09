export interface UserProfile {
  id?: string;
  user_id: string;
  name: string;
  ic: string;
  bank_account: string;
  bank_name: string;
  email: string;
  phone: string;
  created_at?: string | Date;
  updated_at?: string | Date;
}
