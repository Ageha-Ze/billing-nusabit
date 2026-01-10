import { z } from 'zod';

export const bankAccountSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    bank_name: z.string().min(2, "Bank name must be at least 2 characters."),
    account_number: z.string().min(3, "Account number seems too short."),
    balance: z.number().min(0, "Balance cannot be negative."),
    is_active: z.boolean(),
});

export type BankAccountFormValues = z.infer<typeof bankAccountSchema>;
