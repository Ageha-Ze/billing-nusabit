"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { Product } from "@/types";
import { revalidatePath } from "next/cache";

export async function createProduct(productData: Omit<Product, 'id' | 'created_at'>) {
    const { data, error } = await supabaseAdmin
        .from("products")
        .insert([productData])
        .select()
        .single();

    if (error) {
        console.error("Error creating product:", error);
        return { error: error.message };
    }
    
    revalidatePath("/master/produk");

    return { data };
}

export async function updateProduct(id: string, productData: Partial<Omit<Product, 'id' | 'created_at'>>) {
    const { data, error } = await supabaseAdmin
        .from("products")
        .update(productData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating product:", error);
        return { error: error.message };
    }

    revalidatePath("/master/produk");
    revalidatePath(`/master/produk/${id}`);

    return { data };
}

export async function deleteProduct(id: string) {
    const { error } = await supabaseAdmin
        .from("products")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting product:", error);
        return { error: error.message };
    }

    revalidatePath("/master/produk");

    return { success: true };
}
