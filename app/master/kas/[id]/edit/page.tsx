import { supabaseAdmin } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EditKasClient from "./EditKasClient";
import { BankAccount } from "@/types"; // Import the BankAccount type

async function getBankAccount(id: string): Promise<BankAccount> {
    const { data: account, error } = await supabaseAdmin
        .from('bank_accounts')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !account) {
        notFound();
    }

    return account;
}

export default async function EditKasPage({ params }: { params: { id: string } }) {
    const account = await getBankAccount(params.id);
    return <EditKasClient account={account} />;
}
