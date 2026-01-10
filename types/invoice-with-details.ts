import { Client, Invoice } from "@/types";

export type InvoiceWithDetails = Invoice & {
    client: Pick<Client, 'name' | 'email'>;
};
