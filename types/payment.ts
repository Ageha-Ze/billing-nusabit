export type Payment = {
  id: string;
  invoice_id: string;
  bank_account_id: string;
  amount: number;
  method: 'MANUAL' | 'BANK_TRANSFER';
  payment_date: string;
  notes: string | null;
  created_at: string;
};
