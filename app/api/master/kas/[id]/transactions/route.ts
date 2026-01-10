import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: bankAccountId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const offset = (page - 1) * limit;

    try {
        // Fetch payments (INCOME for this bank account)
        const { data: payments, error: paymentsError } = await supabaseAdmin
            .from('payments')
            .select(`
                id,
                amount,
                created_at,
                method,
                notes,
                invoices!inner(invoice_number, clients!inner(name))
            `)
            .eq('bank_account_id', bankAccountId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit / 2 - 1); // Get half for payments

        if (paymentsError) {
            console.error("Error fetching payments for bank account:", paymentsError);
            return NextResponse.json({ error: paymentsError.message }, { status: 500 });
        }

        // Fetch cash flow entries (both INCOME and EXPENSE for this bank account)
        const { data: cashFlows, error: cashFlowError } = await supabaseAdmin
            .from('cash_flow')
            .select(`
                id,
                amount,
                created_at,
                type,
                description,
                category
            `)
            .eq('bank_account_id', bankAccountId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit / 2 - 1); // Get half for cash flows

        if (cashFlowError) {
            console.error("Error fetching cash flows for bank account:", cashFlowError);
            return NextResponse.json({ error: cashFlowError.message }, { status: 500 });
        }

        // Combine and format transactions
        const combinedTransactions = [
            ...(payments || []).map(p => ({
                id: p.id,
                date: p.created_at,
                description: `Payment for Invoice ${(p.invoices as any)?.invoice_number || 'N/A'} from ${(p.invoices as any)?.clients?.name || 'N/A'}`,
                type: 'INCOME', // Mark as INCOME explicitly
                category: `Payment via ${p.method}`,
                amount: p.amount,
            })),
            ...(cashFlows || []).map(cf => ({
                id: cf.id,
                date: cf.created_at,
                description: cf.description || cf.category,
                type: cf.type,
                category: cf.category,
                amount: cf.amount,
            }))
        ];

        // Sort by date (most recent first)
        combinedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Simple total count (might not be accurate for combined + paginated results)
        const totalCount = (payments?.length || 0) + (cashFlows?.length || 0);

        return NextResponse.json({
            data: combinedTransactions,
            total: totalCount,
            page,
            limit,
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
