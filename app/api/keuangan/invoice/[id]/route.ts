import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        // First check if invoice exists
        const { data: basicInvoice, error: basicError } = await supabaseAdmin
            .from('invoices')
            .select('*')
            .eq('id', id)
            .single();

        if (basicError || !basicInvoice) {
            console.error("Invoice not found:", basicError);
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Try to get client data
        let client = null;
        if (basicInvoice.client_id) {
            const { data: clientData } = await supabaseAdmin
                .from('clients')
                .select('name, email')
                .eq('id', basicInvoice.client_id)
                .single();
            client = clientData;
        }

        // Create virtual item matching the total_amount from database
        const items = [{
            id: `item-${id}`,
            invoice_id: id,
            description: 'Service',
            quantity: 1,
            unit_price: parseFloat(basicInvoice.total_amount.toString()),
            total_price: parseFloat(basicInvoice.total_amount.toString()),
            product: null
        }];

        // Return invoice with manually fetched relations
        return NextResponse.json({
            ...basicInvoice,
            client,
            items: items || []
        });

    } catch (e: any) {
        console.error("Error fetching invoice:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { client_id, subscription_id, total_amount, due_date, status } = body;

        const { data: invoice, error } = await supabaseAdmin
            .from('invoices')
            .update({
                client_id,
                subscription_id: subscription_id || null,
                total_amount,
                due_date,
                status,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error("Error updating invoice:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(invoice);

    } catch (e: any) {
        console.error("Error updating invoice:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const { error } = await supabaseAdmin
            .from('invoices')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting invoice:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Invoice deleted successfully' });

    } catch (e: any) {
        console.error("Error deleting invoice:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
