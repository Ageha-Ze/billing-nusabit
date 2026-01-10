import { z } from 'zod';

export const cashFlowSchema = z.object({
    jenis: z.enum(['masuk', 'keluar'], { message: "Type must be either masuk or keluar." }),
    kategori: z.string().min(2, "Category must be at least 2 characters."),
    jumlah: z.number().min(0.01, "Amount must be a positive number."),
    keterangan: z.string().nullable().optional(),
    tanggal: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
    kas_id: z.string().uuid("Invalid bank account selected.").nullable(),
});

export type CashFlowFormValues = z.infer<typeof cashFlowSchema>;
