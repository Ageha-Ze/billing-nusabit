export type SubscriptionWithDetails = Subscription & {
  client: {
    name: string;
    email: string;
  };
  product: {
    name: string;
    price: number;
  };
};

export type Subscription = {
  id: string;
  client_id: string;
  product_id: string;
  start_date: string;
  expiry_date: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  package_details: string | null;
  created_at: string;
};
