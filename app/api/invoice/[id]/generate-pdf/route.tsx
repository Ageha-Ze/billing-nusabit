import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { supabaseAdmin } from '../../../../../lib/supabase/server';
import { InvoiceWithDetails } from '../../../../../types';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    lineHeight: 1.5,
    flexDirection: 'column',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#005f73',
  },
  section: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  text: {
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
    marginTop: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: 'grey',
  },
});

const InvoicePDFDocument = ({ invoice }: { invoice: InvoiceWithDetails }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>INVOICE</Text>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text>Invoice No: <Text style={styles.bold}>{invoice.invoice_number}</Text></Text>
            <Text>Date: {new Date(invoice.created_at).toLocaleDateString()}</Text>
          </View>
          <View style={styles.row}>
            <Text>Due Date: <Text style={styles.bold}>{new Date(invoice.due_date).toLocaleDateString()}</Text></Text>
            <Text>Status: <Text style={styles.bold}>{invoice.status}</Text></Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>Bill To:</Text>
          <Text>{invoice.client.name}</Text>
          <Text>{invoice.client.email}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColHeader}>Description</Text>
            <Text style={styles.tableColHeader}>Qty</Text>
            <Text style={styles.tableColHeader}>Unit Price</Text>
            <Text style={styles.tableColHeader}>Amount</Text>
          </View>
          {invoice.items && invoice.items.length > 0 ? (
            invoice.items.map((item: any, index: number) => (
              <View key={item.id || index} style={styles.tableRow}>
                <Text style={styles.tableCol}>{item.product?.name || item.description}</Text>
                <Text style={styles.tableCol}>{item.quantity}</Text>
                <Text style={styles.tableCol}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(item.unit_price)}</Text>
                <Text style={styles.tableCol}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(item.total_price)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={styles.tableCol}>Service / Product</Text>
              <Text style={styles.tableCol}>1</Text>
              <Text style={styles.tableCol}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(invoice.total_amount)}</Text>
              <Text style={styles.tableCol}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(invoice.total_amount)}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={{ width: '75%', textAlign: 'right' }}>Total:</Text>
            <Text style={{ width: '25%' }}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(invoice.total_amount)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>Nusabit Billing - Thank you for your business!</Text>
      </Page>
    </Document>
  );
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        // Fetch invoice data with all necessary relations
        const { data: basicInvoice, error: basicError } = await supabaseAdmin
            .from('invoices')
            .select('*')
            .eq('id', id)
            .single();

        if (basicError || !basicInvoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Get client data
        let client = null;
        if (basicInvoice.client_id) {
            const { data: clientData } = await supabaseAdmin
                .from('clients')
                .select('name, email')
                .eq('id', basicInvoice.client_id)
                .single();
            client = clientData;
        }

        // Get invoice items with product information
        const { data: itemsData } = await supabaseAdmin
            .from('invoice_items')
            .select(`
                *,
                product:products(name, price)
            `)
            .eq('invoice_id', id);

        let items = [];
        if (itemsData && itemsData.length > 0) {
            items = itemsData;
        } else if (basicInvoice.subscription_id) {
            // Fallback: create item from subscription if no invoice_items exist
            const { data: subscriptionData } = await supabaseAdmin
                .from('subscriptions')
                .select(`
                    *,
                    product:products(name, price)
                `)
                .eq('id', basicInvoice.subscription_id)
                .single();

            if (subscriptionData && subscriptionData.product) {
                items = [{
                    id: `sub-${subscriptionData.id}`,
                    invoice_id: id,
                    description: subscriptionData.product.name || 'Subscription Service',
                    quantity: 1,
                    unit_price: parseFloat(basicInvoice.total_amount.toString()),
                    total_price: parseFloat(basicInvoice.total_amount.toString()),
                    product: subscriptionData.product
                }];
            } else {
                // If no subscription data, create a generic item with the total amount
                items = [{
                    id: 'generic-item',
                    invoice_id: id,
                    description: 'Service',
                    quantity: 1,
                    unit_price: parseFloat(basicInvoice.total_amount.toString()),
                    total_price: parseFloat(basicInvoice.total_amount.toString()),
                    product: null
                }];
            }
        } else {
            // No subscription, create generic item with total amount
            items = [{
                id: 'generic-item',
                invoice_id: id,
                description: 'Service',
                quantity: 1,
                unit_price: parseFloat(basicInvoice.total_amount.toString()),
                total_price: parseFloat(basicInvoice.total_amount.toString()),
                product: null
            }];
        }

        const invoiceData: InvoiceWithDetails = {
            ...basicInvoice,
            client: client || { name: 'Client', email: 'N/A' },
            items: items || []
        };

        // Generate PDF
        const pdfBuffer = await renderToBuffer(<InvoicePDFDocument invoice={invoiceData} />);

        // Return PDF as response
        return new NextResponse(pdfBuffer as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${basicInvoice.invoice_number}.pdf"`,
            },
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}