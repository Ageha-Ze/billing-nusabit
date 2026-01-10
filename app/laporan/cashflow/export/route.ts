import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { convertToCsv } from "@/lib/helpers/csv-exporter";
import { CashFlowWithDetails } from "@/types";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type') || '';
    const bankAccountFilter = searchParams.get('bank_account_id') || '';
    const startDateFilter = searchParams.get('start_date') || '';
    const endDateFilter = searchParams.get('end_date') || '';
    const search = searchParams.get('search') || '';

    try {
        let query = supabaseAdmin
            .from('cash_flow')
            .select(`
                id,
                type,
                category,
                amount,
                description,
                date,
                created_at,
                bank_account:bank_accounts(name, bank_name)
            `);
        
        if (search) {
            query = query.or(`description.ilike.%${search}%,category.ilike.%${search}%`);
        }
        if (typeFilter) {
            query = query.eq('type', typeFilter);
        }
        if (bankAccountFilter) {
            query = query.eq('bank_account_id', bankAccountFilter);
        }
        if (startDateFilter) {
            query = query.gte('date', startDateFilter);
        }
        if (endDateFilter) {
            query = query.lte('date', endDateFilter);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching cash flow for export:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Define columns for CSV
        const columns = [
            { header: "ID", accessorKey: "id" },
            { header: "Date", accessorKey: "date" },
            { header: "Type", accessorKey: "type" },
            { header: "Category", accessorKey: "category" },
            { header: "Description", accessorKey: "description" },
            { header: "Amount", accessorKey: "amount" },
            { header: "Bank Account Name", accessorKey: "bank_account.name" },
            { header: "Bank Name", accessorKey: "bank_account.bank_name" },
            { header: "Created At", accessorKey: "created_at" },
        ];

        const csv = convertToCsv(data as CashFlowWithDetails[], columns);

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="cashflow_report_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
