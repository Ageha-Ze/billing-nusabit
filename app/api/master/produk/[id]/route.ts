import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { data: product, error } = await supabaseAdmin
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error("Error fetching product:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const { data: product, error } = await supabaseAdmin
            .from('products')
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error("Error updating product:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(product);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { error } = await supabaseAdmin
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting product:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: "Product deleted successfully" });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}