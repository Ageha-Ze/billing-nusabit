export type Invoice = {
  id: string;
  invoice_number: string;
  client_id: string;
  subscription_id: string | null;
  total_amount: number;
  status: 'UNPAID' | 'PAID' | 'OVERDUE';
  due_date: string;
  pdf_url: string | null;
  created_at: string;
};
