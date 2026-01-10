import { z } from 'zod';

export const userSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
    password: z.string().min(6, "Password must be at least 6 characters.").optional(), // Optional for updates
    role: z.enum(['ADMIN', 'USER', 'KEUANGAN', 'KASIR']),
});

export type UserFormValues = z.infer<typeof userSchema>;
