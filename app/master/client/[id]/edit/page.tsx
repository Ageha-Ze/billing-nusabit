// ==========================================
// FILE 6: page.tsx (Edit Client Page)
// Path: /master/client/[id]/edit/page.tsx
// ==========================================
import { supabaseAdmin } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EditClient from "./EditClient";

async function getClient(id: string) {
    const { data: client, error } = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error || !client) {
        notFound();
    }

    return client;
}

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const client = await getClient(id);
    return <EditClient client={client} />;
}