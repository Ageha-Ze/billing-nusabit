"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { User } from "@/types";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs"; // For password hashing

export async function createUser(userData: { name: string; email: string; role: User['role']; password?: string }) {
    if (!userData.password) {
        return { error: "Password is required for new users." };
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(userData.password, 10); // 10 is a good salt rounds value

    const { data, error } = await supabaseAdmin
        .from("users")
        .insert([{ 
            name: userData.name,
            email: userData.email,
            password_hash: hashedPassword,
            role: userData.role || 'USER', // Default to USER if not provided
        }])
        .select()
        .single();

    if (error) {
        console.error("Error creating user:", error);
        return { error: error.message };
    }
    
    revalidatePath("/master/user");

    return { data };
}

export async function updateUser(id: string, userData: Partial<Omit<User, 'id' | 'created_at'>> & { password?: string }) {
    // If password is provided, hash it before updating
    if (userData.password) {
        userData.password_hash = await bcrypt.hash(userData.password, 10);
        delete userData.password; // Remove plain text password
    }

    const { data, error } = await supabaseAdmin
        .from("users")
        .update(userData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating user:", error);
        return { error: error.message };
    }

    revalidatePath("/master/user");
    revalidatePath(`/master/user/${id}`);

    return { data };
}

export async function deleteUser(id: string) {
    const { error } = await supabaseAdmin
        .from("users")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting user:", error);
        return { error: error.message };
    }

    revalidatePath("/master/user");

    return { success: true };
}
