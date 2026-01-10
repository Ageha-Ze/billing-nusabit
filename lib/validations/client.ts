import { z } from 'zod';

export const clientSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
    phone_wa: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    identity_no: z.string().nullable().optional(),
    ktp_file_url: z.string().nullable().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
