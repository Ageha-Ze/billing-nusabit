import { Payment, Invoice, BankAccount } from "@/types";

export type PaymentWithDetails = Payment & {
    invoice: Pick<Invoice, 'invoice_number' | 'client_id' | 'total_amount'>;
    bank_account: Pick<BankAccount, 'name' | 'bank_name'>;
};
