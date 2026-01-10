"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { Invoice, InvoiceWithDetails } from "@/types";
import { revalidatePath } from "next/cache";
import { generateAndUploadInvoicePdf } from "@/lib/helpers/pdfGenerator";

// This function assumes you have created the `generate_invoice_number` function in your database.
async function getNextInvoiceNumber() {
    const { data, error } = await supabaseAdmin.rpc('generate_invoice_number');
    if (error) {
        throw new Error(error.message);
    }
    return data;
}

export async function createInvoice(invoiceData: Omit<Invoice, 'id' | 'created_at' | 'invoice_number' | 'pdf_url'>) {
    try {
        const invoiceNumber = await getNextInvoiceNumber();

        // Insert the invoice first
        const { data: newInvoice, error: insertError } = await supabaseAdmin
            .from("invoices")
            .insert([{
                ...invoiceData,
                id: invoiceNumber, // Assuming id and invoice_number are the same
                invoice_number: invoiceNumber
            }])
            .select(`
                *,
                client:clients(name, email)
            `) // Select client data for PDF generation
            .single();

        if (insertError || !newInvoice) {
            console.error("Error creating invoice:", insertError);
            return { error: insertError?.message || "Failed to create invoice." };
        }

        // Create invoice item based on user input
        if (invoiceData.subscription_id) {
            const { data: subscription, error: subError } = await supabaseAdmin
                .from('subscriptions')
                .select(`
                    *,
                    product:products(*)
                `)
                .eq('id', invoiceData.subscription_id)
                .single();

            if (subscription && !subError) {
                // Create invoice item using the manually entered total_amount
                const { error: itemError } = await supabaseAdmin
                    .from('invoice_items')
                    .insert([{
                        invoice_id: invoiceNumber,
                        product_id: subscription.product_id,
                        description: subscription.product?.name || 'Service',
                        quantity: 1,
                        unit_price: parseFloat(invoiceData.total_amount.toString()),
                        total_price: parseFloat(invoiceData.total_amount.toString())
                    }]);

                if (itemError) {
                    console.error("Error creating invoice item:", itemError);
                    // Don't fail the whole operation, just log the error
                }
            }
        } else {
            // If no subscription, create a generic invoice item
            const { error: itemError } = await supabaseAdmin
                .from('invoice_items')
                .insert([{
                    invoice_id: invoiceNumber,
                    description: 'Service',
                    quantity: 1,
                    unit_price: parseFloat(invoiceData.total_amount.toString()),
                    total_price: parseFloat(invoiceData.total_amount.toString())
                }]);

            if (itemError) {
                console.error("Error creating invoice item:", itemError);
            }
        }

        // Generate and upload PDF
        const pdfUrl = await generateAndUploadInvoicePdf(newInvoice as InvoiceWithDetails);

        // Update invoice with PDF URL
        const { data: updatedInvoice, error: updateError } = await supabaseAdmin
            .from("invoices")
            .update({ pdf_url: pdfUrl })
            .eq("id", newInvoice.id)
            .select()
            .single();

        if (updateError || !updatedInvoice) {
            console.error("Error updating invoice with PDF URL:", updateError);
            // Consider rolling back PDF upload or handling orphaned PDFs
            return { error: updateError?.message || "Failed to update invoice with PDF URL." };
        }

        revalidatePath("/keuangan/invoice");

        return { data: updatedInvoice };

    } catch (error: any) {
        console.error("Error in createInvoice action:", error);
        return { error: error.message };
    }
}

export async function updateInvoice(id: string, invoiceData: Partial<Omit<Invoice, 'id' | 'created_at' | 'invoice_number'>>) {
    // First update the invoice
    const { data, error } = await supabaseAdmin
        .from("invoices")
        .update(invoiceData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating invoice:", error);
        return { error: error.message };
    }

    // If total_amount was updated, update the corresponding invoice_items
    if (invoiceData.total_amount) {
        const { error: itemError } = await supabaseAdmin
            .from('invoice_items')
            .update({
                unit_price: parseFloat(invoiceData.total_amount.toString()),
                total_price: parseFloat(invoiceData.total_amount.toString())
            })
            .eq('invoice_id', id);

        if (itemError) {
            console.error("Error updating invoice items:", itemError);
            // Don't fail the whole operation
        }
    }

    revalidatePath("/keuangan/invoice");
    revalidatePath(`/keuangan/invoice/${id}`);

    return { data };
}

export async function deleteInvoice(id: string) {
    const { error } = await supabaseAdmin
        .from("invoices")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting invoice:", error);
        return { error: error.message };
    }

    revalidatePath("/keuangan/invoice");

    return { success: true };
}

