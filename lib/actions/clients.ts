"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { supabaseStorage, storageBucket } from "@/lib/supabase/storage"; // Import storage client and helper
import { Client } from "@/types";
import { revalidatePath } from "next/cache";

const KTP_BUCKET = "ktp-files"; // Define a bucket name for KTP files

export async function createClient(clientData: Omit<Client, 'id' | 'created_at' | 'ktp_file_url'>, ktpFile?: File | null) {
    let ktp_file_url: string | null = null;

    if (ktpFile) {
        // Upload KTP file to Supabase Storage
        const filePath = `ktp/${clientData.email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
        const { data: uploadData, error: uploadError } = await storageBucket(KTP_BUCKET) // Use helper
            .upload(filePath, ktpFile, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error("Error uploading KTP file:", uploadError);
            return { error: `Failed to upload KTP file: ${uploadError.message}` };
        }

        const { data: publicUrlData } = storageBucket(KTP_BUCKET).getPublicUrl(filePath); // Use helper
        ktp_file_url = publicUrlData.publicUrl;
    }

    const { data, error } = await supabaseAdmin
        .from("clients")
        .insert([{ 
            ...clientData,
            ktp_file_url: ktp_file_url,
        }])
        .select()
        .single();

    if (error) {
        console.error("Error creating client:", error);
        return { error: error.message };
    }
    
    revalidatePath("/master/client");

    return { data };
}

export async function updateClient(id: string, clientData: Partial<Omit<Client, 'id' | 'created_at' | 'ktp_file_url'>>, ktpFile?: File | null) {
    let ktp_file_url: string | null | undefined = undefined; // Undefined means don't update

    if (ktpFile === null) { // User explicitly removed file
        ktp_file_url = null;
        // Optionally, delete old file from storage
    } else if (ktpFile instanceof File) {
        // Upload new KTP file
        const filePath = `ktp/${clientData.email?.replace(/[^a-zA-Z0-9]/g, '_') || id}_${Date.now()}`;
        const { data: uploadData, error: uploadError } = await storageBucket(KTP_BUCKET) // Use helper
            .upload(filePath, ktpFile, {
                cacheControl: '3600',
                upsert: true, // Upsert to overwrite if same name
            });

        if (uploadError) {
            console.error("Error uploading KTP file:", uploadError);
            return { error: `Failed to upload KTP file: ${uploadError.message}` };
        }
        const { data: publicUrlData } = storageBucket(KTP_BUCKET).getPublicUrl(filePath); // Use helper
        ktp_file_url = publicUrlData.publicUrl;
    }


    const { data, error } = await supabaseAdmin
        .from("clients")
        .update({
            ...clientData,
            ktp_file_url: ktp_file_url, // This will be null if removed, a new URL if uploaded, or undefined if unchanged
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating client:", error);
        return { error: error.message };
    }

    revalidatePath("/master/client");
    revalidatePath(`/master/client/${id}`);

    return { data };
}

export async function deleteClient(id: string) {
    // Optionally, delete KTP file from storage when client is deleted
    const { error } = await supabaseAdmin
        .from("clients")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting client:", error);
        return { error: error.message };
    }

    revalidatePath("/master/client");

    return { success: true };
}