"use server";

import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { User } from "@/types";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

// A secret key for signing JWTs. In a real production app, this should be a long,
// complex, and securely stored environment variable.
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-that-is-long-and-secure";
const COOKIE_NAME = "user_session";

export async function login(formData: unknown) {
    const validatedFields = loginSchema.safeParse(formData);

    if (!validatedFields.success) {
        return { error: "Invalid fields provided." };
    }

    const { email, password } = validatedFields.data;

    const { data: user, error } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

    if (error || !user) {
        console.error("Login error:", error?.message);
        return { error: "Invalid email or password." };
    }

    // The prompt specifies plain text password storage and comparison.
    // In a real-world scenario, you should ALWAYS hash passwords.
    // Example: const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
    const isPasswordCorrect = password === user.password_hash;

    if (!isPasswordCorrect) {
        return { error: "Invalid email or password." };
    }
    
    if (!user.is_active) {
        return { error: "Your account has been deactivated." };
    }


    // Create session token
    const sessionPayload: Pick<User, 'id' | 'name' | 'email' | 'role'> = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const token = jwt.sign(sessionPayload, JWT_SECRET, {
        expiresIn: "7d",
    });

    // Set the cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
    });

    return { success: true };
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

