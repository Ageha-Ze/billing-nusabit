import { z } from 'zod';

export const invoiceSchema = z.object({
    client_id: z.string().uuid("Invalid client selected."),
    subscription_id: z.string().uuid("Invalid subscription selected.").optional().nullable(),
    total_amount: z.number().min(0, "Total amount must be a positive number."),
    due_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
    status: z.enum(['UNPAID', 'PAID', 'OVERDUE']),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
