import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const { data, error } = await supabaseAdmin
            .from('bank_accounts')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            console.error("Error fetching bank account:", error);
            return NextResponse.json({ error: "Bank account not found" }, { status: 404 });
        }

        return NextResponse.json({ data });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
