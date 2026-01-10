"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { CashFlow } from "@/types";
import { revalidatePath } from "next/cache";

export async function createCashFlowEntry(entryData: {
  jenis: 'masuk' | 'keluar';
  kategori: string;
  jumlah: number;
  keterangan: string | null;
  tanggal: string;
  kas_id: string | null;
}) {
    try {
        const { data: newEntry, error: entryError } = await supabaseAdmin
            .from("transaksi_harian")
            .insert([{
                jenis: entryData.jenis,
                kategori: entryData.kategori,
                jumlah: entryData.jumlah,
                keterangan: entryData.keterangan,
                tanggal: entryData.tanggal,
                kas_id: entryData.kas_id,
                created_by: null, // You can set this to the current user if available
            }])
            .select()
            .single();

        if (entryError || !newEntry) {
            console.error("Error creating cash flow entry:", entryError);
            return { error: entryError?.message || "Failed to create cash flow entry." };
        }

        // Update bank account balance if kas_id is provided
        if (newEntry.kas_id) {
            const { data: bankAccount, error: fetchAccountError } = await supabaseAdmin
                .from('bank_accounts')
                .select('balance')
                .eq('id', newEntry.kas_id)
                .single();

            if (fetchAccountError || !bankAccount) {
                console.error("Error fetching bank account for update:", fetchAccountError);
                return { error: fetchAccountError?.message || "Failed to fetch bank account." };
            }

            let newBalance = bankAccount.balance;
            if (newEntry.jenis === 'masuk') {
                newBalance += newEntry.jumlah;
            } else if (newEntry.jenis === 'keluar') {
                newBalance -= newEntry.jumlah;
            }

            const { error: balanceUpdateError } = await supabaseAdmin
                .from("bank_accounts")
                .update({ balance: newBalance })
                .eq("id", newEntry.kas_id);

            if (balanceUpdateError) {
                console.error("Error updating bank account balance:", balanceUpdateError);
                return { error: balanceUpdateError.message };
            }
        }
        
        revalidatePath("/keuangan/transaksiharian");
        revalidatePath("/master/kas"); // Revalidate kas list
        revalidatePath("/dashboard");

        return { data: newEntry };

    } catch (error: any) {
        console.error("Error in createCashFlowEntry action:", error);
        return { error: error.message };
    }
}

export async function updateCashFlowEntry(id: number, entryData: Partial<Omit<CashFlow, 'id' | 'created_at' | 'updated_at'>>) {
    // Updating cash flow entries with financial side effects is complex.
    // A robust system would need to reverse previous balance changes and apply new ones.
    // For simplicity, this update will only change the cash flow record itself.
    // Bank account balances are NOT automatically updated on edit here.
    const updateData: any = {};
    if (entryData.jenis) updateData.jenis = entryData.jenis;
    if (entryData.kategori) updateData.kategori = entryData.kategori;
    if (entryData.jumlah !== undefined) updateData.jumlah = entryData.jumlah;
    if (entryData.keterangan !== undefined) updateData.keterangan = entryData.keterangan;
    if (entryData.tanggal) updateData.tanggal = entryData.tanggal;
    if (entryData.kas_id !== undefined) updateData.kas_id = entryData.kas_id;

    const { data, error } = await supabaseAdmin
        .from("transaksi_harian")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating cash flow entry:", error);
        return { error: error.message };
    }

    revalidatePath("/keuangan/transaksiharian");
    revalidatePath(`/keuangan/transaksiharian/${id}`);
    revalidatePath("/master/kas");
    revalidatePath("/dashboard");

    return { data };
}

export async function deleteCashFlowEntry(id: number) {
    // Deleting cash flow entries with financial side effects is complex.
    // A robust system would need to reverse the balance change.
    // For simplicity, this will only delete the cash flow record itself.
    // Bank account balances are NOT automatically reversed on delete here.
    const { error } = await supabaseAdmin
        .from("transaksi_harian")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting cash flow entry:", error);
        return { error: error.message };
    }

    revalidatePath("/keuangan/transaksiharian");
    revalidatePath("/master/kas");
    revalidatePath("/dashboard");

    return { success: true };
}
