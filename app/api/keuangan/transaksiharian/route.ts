import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''; // INCOME or EXPENSE
    const bank_account_id = searchParams.get('bank_account_id') || ''; // Filter by bank account

    const offset = (page - 1) * limit;

    try {
        let query = supabaseAdmin
            .from('transaksi_harian')
            .select(`
                *,
                bank_account:bank_accounts(name, bank_name)
            `, { count: 'exact' })
            .order('tanggal', { ascending: false })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (search) {
            query = query.or(`keterangan.ilike.%${search}%,kategori.ilike.%${search}%`);
        }

        if (type) {
            // Convert INCOME/EXPENSE to masuk/keluar
            const jenisValue = type === 'INCOME' ? 'masuk' : 'keluar';
            query = query.eq('jenis', jenisValue);
        }

        if (bank_account_id) {
            query = query.eq('kas_id', bank_account_id);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error("Error fetching cash flow entries:", error);
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