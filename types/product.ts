export type Product = {
  id: string;
  name: string;
  type: 'HOSTING' | 'DOMAIN' | 'WEB';
  price: number;
  created_at: string;
};
