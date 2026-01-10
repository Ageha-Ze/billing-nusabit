import { z } from 'zod';

export const paymentSchema = z.object({
    invoice_id: z.string().min(1, "Invoice is required."),
    bank_account_id: z.string().uuid("Invalid bank account selected."),
    amount: z.number().min(0.01, "Amount must be a positive number."),
    method: z.enum(['MANUAL', 'BANK_TRANSFER']),
    notes: z.string().nullable().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
