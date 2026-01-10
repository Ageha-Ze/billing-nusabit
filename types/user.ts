export type User = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'ADMIN' | 'USER' | 'KEUANGAN' | 'KASIR';
  is_active: boolean;
  created_at: string;
  updated_at?: string;
};
