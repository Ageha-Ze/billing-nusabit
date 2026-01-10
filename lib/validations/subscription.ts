import { z } from 'zod';

export const subscriptionSchema = z.object({
    client_id: z.string().uuid("Invalid client selected."),
    product_id: z.string().uuid("Invalid product selected."),
    start_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
    expiry_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
    status: z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED']),
    package_details: z.string().nullable().optional(),
});

export type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;
