"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { Subscription } from "@/types";
import { revalidatePath } from "next/cache";

export async function createSubscription(subscriptionData: Omit<Subscription, 'id' | 'created_at'>) {
    const { data, error } = await supabaseAdmin
        .from("subscriptions")
        .insert([subscriptionData])
        .select()
        .single();

    if (error) {
        console.error("Error creating subscription:", error);
        return { error: error.message };
    }
    
    revalidatePath("/keuangan/subscription");

    return { data };
}

export async function updateSubscription(id: string, subscriptionData: Partial<Omit<Subscription, 'id' | 'created_at'>>) {
    const { data, error } = await supabaseAdmin
        .from("subscriptions")
        .update(subscriptionData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating subscription:", error);
        return { error: error.message };
    }

    revalidatePath("/keuangan/subscription");
    revalidatePath(`/keuangan/subscription/${id}`);

    return { data };
}

export async function deleteSubscription(id: string) {
    const { error } = await supabaseAdmin
        .from("subscriptions")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting subscription:", error);
        return { error: error.message };
    }

    revalidatePath("/keuangan/subscription");

    return { success: true };
}
