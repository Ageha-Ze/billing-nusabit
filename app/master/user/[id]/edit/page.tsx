import { supabaseAdmin } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EditUser from "./EditUser";

async function getUser(id: string) {
    const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !user) {
        notFound();
    }

    return user;
}

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getUser(id);
    return <EditUser user={user} />;
}