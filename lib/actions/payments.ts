"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { Payment } from "@/types";
import { revalidatePath } from "next/cache";

export async function createPayment(paymentData: Omit<Payment, 'id' | 'created_at' | 'payment_date'>) {
    try {
        // 1. Insert the payment
        const { data: newPayment, error: paymentError } = await supabaseAdmin
            .from("payments")
            .insert([{ ...paymentData, payment_date: new Date().toISOString() }])
            .select()
            .single();

        if (paymentError || !newPayment) {
            console.error("Error creating payment:", paymentError);
            return { error: paymentError?.message || "Failed to record payment." };
        }

        // 2. Update the associated invoice status to PAID
        const { error: invoiceUpdateError } = await supabaseAdmin
            .from("invoices")
            .update({ status: 'PAID' })
            .eq("id", paymentData.invoice_id);

        if (invoiceUpdateError) {
            console.error("Error updating invoice status:", invoiceUpdateError);
            // Consider rolling back payment creation here if desired
            return { error: invoiceUpdateError.message };
        }

        // 3. Update the balance of the associated bank account
        const { data: bankAccount, error: fetchAccountError } = await supabaseAdmin
            .from('bank_accounts')
            .select('balance')
            .eq('id', paymentData.bank_account_id)
            .single();

        if (fetchAccountError || !bankAccount) {
            console.error("Error fetching bank account for update:", fetchAccountError);
            return { error: fetchAccountError?.message || "Failed to fetch bank account." };
        }

        const newBalance = bankAccount.balance + paymentData.amount;
        const { error: balanceUpdateError } = await supabaseAdmin
            .from("bank_accounts")
            .update({ balance: newBalance })
            .eq("id", paymentData.bank_account_id);
        
        if (balanceUpdateError) {
            console.error("Error updating bank account balance:", balanceUpdateError);
            return { error: balanceUpdateError.message };
        }

        // 4. Auto-create a cash flow entry for INCOME
        const { error: cashflowError } = await supabaseAdmin
            .from("cash_flow")
            .insert([{
                type: 'INCOME',
                category: 'Payment Received', // Can be more specific
                amount: paymentData.amount,
                description: `Payment for invoice ${paymentData.invoice_id}`,
                date: new Date().toISOString().split('T')[0],
            }]);
        
        if (cashflowError) {
            console.error("Error creating cash flow entry:", cashflowError);
            return { error: cashflowError.message };
        }
        
        revalidatePath("/keuangan/payment");
        revalidatePath("/keuangan/invoice");
        revalidatePath("/master/kas"); // Revalidate bank account list

        return { data: newPayment };

    } catch (error: any) {
        console.error("Error in createPayment action:", error);
        return { error: error.message };
    }
}

export async function updatePayment(id: string, paymentData: Partial<Omit<Payment, 'id' | 'created_at'>>) {
    // Note: Updating payments is complex due to its side effects (invoice status, bank balance, cash flow).
    // For simplicity, this update will only change the payment record itself, not reverse side effects.
    // A robust system would require careful consideration of these dependencies for updates.
    const { data, error } = await supabaseAdmin
        .from("payments")
        .update(paymentData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating payment:", error);
        return { error: error.message };
    }

    revalidatePath("/keuangan/payment");
    revalidatePath(`/keuangan/payment/${id}`);

    return { data };
}

export async function deletePayment(id: string) {
    try {
        // 1. First, get the payment details to know what to reverse
        const { data: payment, error: fetchError } = await supabaseAdmin
            .from("payments")
            .select("*, invoice_id, bank_account_id, amount")
            .eq("id", id)
            .single();

        if (fetchError || !payment) {
            console.error("Error fetching payment for deletion:", fetchError);
            return { error: fetchError?.message || "Payment not found." };
        }

        // 2. Check if this is the only payment for the invoice
        // If so, we should revert the invoice status back to UNPAID
        const { data: otherPayments, error: checkPaymentsError } = await supabaseAdmin
            .from("payments")
            .select("id")
            .eq("invoice_id", payment.invoice_id)
            .neq("id", id); // Exclude the current payment

        if (checkPaymentsError) {
            console.error("Error checking other payments:", checkPaymentsError);
            return { error: checkPaymentsError.message };
        }

        // If this was the only payment, revert invoice status
        if (!otherPayments || otherPayments.length === 0) {
            const { error: invoiceUpdateError } = await supabaseAdmin
                .from("invoices")
                .update({ status: 'UNPAID' })
                .eq("id", payment.invoice_id);

            if (invoiceUpdateError) {
                console.error("Error reverting invoice status:", invoiceUpdateError);
                return { error: invoiceUpdateError.message };
            }
        }

        // 3. Reverse the bank account balance (subtract the payment amount)
        const { data: bankAccount, error: fetchAccountError } = await supabaseAdmin
            .from('bank_accounts')
            .select('balance')
            .eq('id', payment.bank_account_id)
            .single();

        if (fetchAccountError || !bankAccount) {
            console.error("Error fetching bank account for balance reversal:", fetchAccountError);
            return { error: fetchAccountError?.message || "Failed to fetch bank account." };
        }

        const reversedBalance = bankAccount.balance - payment.amount;
        const { error: balanceUpdateError } = await supabaseAdmin
            .from("bank_accounts")
            .update({ balance: reversedBalance })
            .eq("id", payment.bank_account_id);

        if (balanceUpdateError) {
            console.error("Error reversing bank account balance:", balanceUpdateError);
            return { error: balanceUpdateError.message };
        }

        // 4. Delete the associated cash flow entry (reverse the INCOME entry)
        const { error: cashflowDeleteError } = await supabaseAdmin
            .from("cash_flow")
            .delete()
            .eq("type", "INCOME")
            .eq("description", `Payment for invoice ${payment.invoice_id}`)
            .eq("amount", payment.amount);

        if (cashflowDeleteError) {
            console.error("Error deleting cash flow entry:", cashflowDeleteError);
            // Note: We don't return error here as the cash flow deletion is not critical
            // The payment deletion can still succeed
        }

        // 5. Finally, delete the payment record
        const { error: paymentDeleteError } = await supabaseAdmin
            .from("payments")
            .delete()
            .eq("id", id);

        if (paymentDeleteError) {
            console.error("Error deleting payment record:", paymentDeleteError);
            return { error: paymentDeleteError.message };
        }

        // Revalidate all affected paths
        revalidatePath("/keuangan/payment");
        revalidatePath("/keuangan/invoice");
        revalidatePath("/master/kas");
        revalidatePath("/laporan/cashflow");

        return { success: true };

    } catch (error: any) {
        console.error("Error in deletePayment action:", error);
        return { error: error.message };
    }
}
