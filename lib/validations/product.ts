import { z } from 'zod';

export const productSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    type: z.enum(['HOSTING', 'DOMAIN', 'WEB']),
    price: z.number().min(0, "Price must be a positive number."),
});

export type ProductFormValues = z.infer<typeof productSchema>;
