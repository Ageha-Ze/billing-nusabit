import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { convertToCsv } from "@/lib/helpers/csv-exporter";
import { InvoiceWithDetails } from "@/types";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || '';
    const startDateFilter = searchParams.get('start_date') || '';
    const endDateFilter = searchParams.get('end_date') || '';
    const search = searchParams.get('search') || '';

    try {
        let query = supabaseAdmin
            .from('invoices')
            .select(`
                id,
                invoice_number,
                total_amount,
                status,
                due_date,
                created_at,
                client:clients(name, email)
            `);
        
        if (search) {
            query = query.ilike('invoice_number', `%${search}%`);
        }
        if (statusFilter) {
            query = query.eq('status', statusFilter);
        }
        if (startDateFilter) {
            query = query.gte('created_at', startDateFilter);
        }
        if (endDateFilter) {
            query = query.lte('created_at', endDateFilter);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching invoices for export:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Define columns for CSV
        const columns = [
            { header: "Invoice ID", accessorKey: "id" },
            { header: "Invoice Number", accessorKey: "invoice_number" },
            { header: "Client Name", accessorKey: "client.name" },
            { header: "Client Email", accessorKey: "client.email" },
            { header: "Total Amount", accessorKey: "total_amount" },
            { header: "Status", accessorKey: "status" },
            { header: "Due Date", accessorKey: "due_date" },
            { header: "Created At", accessorKey: "created_at" },
        ];

        const csv = convertToCsv(data as InvoiceWithDetails[], columns);

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="invoices_report_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
