import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * limit;

    try {
        let query = supabaseAdmin
            .from('payments')
            .select(`
                *,
                invoice:invoices(invoice_number, client_id, total_amount),
                bank_account:bank_accounts(name, bank_name)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (search) {
            // Search by invoice number or bank account name
            query = query.or(`invoice.invoice_number.ilike.%${search}%,bank_account.name.ilike.%${search}%`);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error("Error fetching payments:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            data,
            total: count,
            page,
            limit,
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
