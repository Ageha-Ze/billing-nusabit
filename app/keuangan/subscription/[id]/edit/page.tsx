import { supabaseAdmin } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EditSubscription from "./EditSubscription";

async function getSubscription(id: string) {
    const { data: subscription, error } = await supabaseAdmin
        .from('subscriptions')
        .select(`
            *,
            client:clients(id, name, email),
            product:products(id, name)
        `)
        .eq('id', id)
        .single();

    if (error || !subscription) {
        notFound();
    }

    return subscription;
}

export default async function EditSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const subscription = await getSubscription(id);
    return <EditSubscription subscription={subscription} />;
}