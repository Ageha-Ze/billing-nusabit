import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { notFound } from "next/navigation";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { data: invoice, error } = await supabaseAdmin
        .from('invoices')
        .select('pdf_url, invoice_number')
        .eq('id', id)
        .single();

    if (error || !invoice || !invoice.pdf_url) {
        notFound();
    }

    // Redirect to the public URL for download
    // Next.js automatically handles streaming and headers for redirects to external URLs
    return NextResponse.redirect(invoice.pdf_url, {
        headers: {
            'Content-Disposition': `attachment; filename="${invoice.invoice_number}.pdf"`,
        },
    });
}
