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
            .from('subscriptions')
            .select(`
                *,
                client:clients(name, email),
                product:products(name, price)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (search) {
            // This search is a bit more complex as it involves related tables.
            // For now, let's keep it simple and search on a field in the subscription table itself, e.g., status.
            // A more advanced search would require a database function or more complex query.
            query = query.ilike('status', `%${search}%`);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error("Error fetching subscriptions:", error);
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
