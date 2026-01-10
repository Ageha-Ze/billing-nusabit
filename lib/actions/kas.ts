"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { BankAccount } from "@/types";
import { revalidatePath } from "next/cache";

export async function createBankAccount(accountData: Omit<BankAccount, 'id' | 'created_at'>) {
    const { data, error } = await supabaseAdmin
        .from("bank_accounts")
        .insert([accountData])
        .select()
        .single();

    if (error) {
        console.error("Error creating bank account:", error);
        return { error: error.message };
    }
    
    revalidatePath("/master/kas");

    return { data };
}

export async function updateBankAccount(id: string, accountData: Partial<Omit<BankAccount, 'id' | 'created_at'>>) {
    const { data, error } = await supabaseAdmin
        .from("bank_accounts")
        .update(accountData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating bank account:", error);
        return { error: error.message };
    }

    revalidatePath("/master/kas");
    revalidatePath(`/master/kas/${id}`);

    return { data };
}

export async function deleteBankAccount(id: string) {
    const { error } = await supabaseAdmin
        .from("bank_accounts")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting bank account:", error);
        return { error: error.message };
    }

    revalidatePath("/master/kas");

    return { success: true };
}
