"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer, FileText, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product?: {
        name: string;
        price: number;
    };
}

interface Invoice {
    id: string;
    invoice_number: string;
    total_amount: number;
    subtotal?: number;
    tax_amount?: number;
    status: string;
    due_date: string;
    created_at: string;
    client?: {
        name: string;
        email: string;
    };
    items?: InvoiceItem[];
}

export default function InvoiceViewPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [id, setId] = useState<string | null>(null);

    useEffect(() => {
        async function getParams() {
            const resolvedParams = await params;
            setId(resolvedParams.id);
        }
        getParams();
    }, [params]);

    useEffect(() => {
        async function fetchInvoice() {
            if (!id) return;

            try {
                const response = await fetch(`/api/keuangan/invoice/${id}`);
                if (!response.ok) {
                    throw new Error('Invoice not found');
                }
                const data = await response.json();
                setInvoice(data);
            } catch (error) {
                console.error('Failed to fetch invoice:', error);
                toast.error('Failed to load invoice');
                router.push('/keuangan/invoice');
            } finally {
                setLoading(false);
            }
        }

        fetchInvoice();
    }, [id, router]);

    const handleDownloadPDF = async () => {
        if (!invoice) return;

        setDownloading(true);
        try {
            // Generate PDF via the generate-pdf API route
            const response = await fetch(`/api/invoice/${invoice.id}/generate-pdf`);
            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${invoice.invoice_number}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('PDF download started');
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download PDF');
        } finally {
            setDownloading(false);
        }
    };

    const handlePrint = () => {
        if (!invoice) return;

        // Create print-specific content that matches PDF layout
        const printContent = document.createElement('div');
        printContent.innerHTML = `
            <div style="font-family: Helvetica, Arial, sans-serif; font-size: 11px; line-height: 1.5; padding: 30px 40px; max-width: none;">
                <h1 style="font-size: 24px; margin-bottom: 20px; text-align: center; color: #005f73;">INVOICE</h1>

                <div style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Invoice No: <strong>${invoice.invoice_number}</strong></span>
                        <span>Date: ${new Date(invoice.created_at).toLocaleDateString('id-ID', {
                            dateStyle: 'long'
                        })}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Due Date: <strong>${new Date(invoice.due_date).toLocaleDateString('id-ID', {
                            dateStyle: 'long'
                        })}</strong></span>
                        <span>Status: <strong>${invoice.status}</strong></span>
                    </div>
                </div>

                <div style="margin-bottom: 10px;">
                    <strong>Bill To:</strong><br>
                    ${invoice.client?.name || 'Client information not available'}<br>
                    ${invoice.client?.email || 'Email not available'}
                </div>

                <table style="width: 100%; border-collapse: collapse; margin: 10px 0; border: 1px solid #000;">
                    <thead>
                        <tr style="background-color: #f0f0f0;">
                            <th style="border: 1px solid #000; padding: 5px; text-align: left;">Description</th>
                            <th style="border: 1px solid #000; padding: 5px; text-align: center;">Qty</th>
                            <th style="border: 1px solid #000; padding: 5px; text-align: right;">Unit Price</th>
                            <th style="border: 1px solid #000; padding: 5px; text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items && invoice.items.length > 0 ?
                            invoice.items.map((item, index) => `
                                <tr key="${item.id || index}">
                                    <td style="border: 1px solid #000; padding: 5px;">${item.product?.name || item.description}</td>
                                    <td style="border: 1px solid #000; padding: 5px; text-align: center;">${item.quantity}</td>
                                    <td style="border: 1px solid #000; padding: 5px; text-align: right;">Rp ${new Intl.NumberFormat("id-ID").format(item.unit_price)}</td>
                                    <td style="border: 1px solid #000; padding: 5px; text-align: right;">Rp ${new Intl.NumberFormat("id-ID").format(item.total_price)}</td>
                                </tr>
                            `).join('') :
                            `<tr>
                                <td colspan="4" style="border: 1px solid #000; padding: 5px; text-align: center;">Service / Product</td>
                                <td style="border: 1px solid #000; padding: 5px; text-align: center;">1</td>
                                <td style="border: 1px solid #000; padding: 5px; text-align: right;">Rp ${new Intl.NumberFormat("id-ID").format(invoice.total_amount)}</td>
                                <td style="border: 1px solid #000; padding: 5px; text-align: right;">Rp ${new Intl.NumberFormat("id-ID").format(invoice.total_amount)}</td>
                            </tr>`
                        }
                    </tbody>
                </table>

                <div style="margin: 10px 0; text-align: right;">
                    <strong>Total: Rp ${new Intl.NumberFormat("id-ID").format(invoice.total_amount)}</strong>
                </div>

                <div style="position: absolute; bottom: 30px; left: 40px; right: 40px; text-align: center; color: grey;">
                    Nusabit Billing - Thank you for your business!
                </div>
            </div>
        `;

        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Invoice ${invoice.invoice_number}</title>
                        <style>
                            body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                            @media print {
                                body { margin: 0; }
                            }
                        </style>
                    </head>
                    <body>
                        ${printContent.innerHTML}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500">Loading invoice...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="p-6 max-w-5xl mx-auto">
                <div className="text-center min-h-[400px] flex items-center justify-center">
                    <div>
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Invoice Not Found</h2>
                        <p className="text-gray-600 mb-4">The invoice you're looking for doesn't exist.</p>
                        <Link href="/keuangan/invoice">
                            <Button>Back to Invoices</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID':
                return 'bg-green-100 text-green-700';
            case 'UNPAID':
                return 'bg-orange-100 text-orange-700';
            case 'OVERDUE':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/keuangan/invoice">
                        <Button variant="outline" className="flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Invoices
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Invoice Details</h1>
                            <p className="text-sm text-gray-600">Invoice #{invoice.invoice_number}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        {downloading ? 'Downloading...' : 'Download PDF'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handlePrint}
                        className="flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Print Invoice
                    </Button>
                </div>
            </div>

            {/* Invoice Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Invoice Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">INVOICE</h2>
                            <p className="text-blue-100">#{invoice.invoice_number}</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-5 h-5" />
                                <span className="text-sm">{new Date(invoice.created_at).toLocaleDateString('id-ID', {
                                    dateStyle: 'long'
                                })}</span>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                                {invoice.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Invoice Content */}
                <div className="p-8">
                    {/* From/To Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">From</h3>
                            <div className="text-gray-700">
                                <p className="font-medium">Nusabit Billing</p>
                                <p className="text-sm">Professional Web Hosting & Domain Services</p>
                                <p className="text-sm">Yogyakarta, Indonesia</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To</h3>
                            <div className="text-gray-700">
                                <p className="font-medium">{invoice.client?.name || 'Client information not available'}</p>
                                <p className="text-sm">{invoice.client?.email || 'Email not available'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Invoice Date</p>
                            <p className="text-sm text-gray-900 mt-1">
                                {new Date(invoice.created_at).toLocaleDateString('id-ID', {
                                    dateStyle: 'long'
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Due Date</p>
                            <p className="text-sm text-gray-900 mt-1">
                                {new Date(invoice.due_date).toLocaleDateString('id-ID', {
                                    dateStyle: 'long'
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Status</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(invoice.status)}`}>
                                {invoice.status}
                            </span>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Items</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-200">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                                        <th className="border border-gray-200 px-4 py-3 text-right text-sm font-medium text-gray-700">Qty</th>
                                        <th className="border border-gray-200 px-4 py-3 text-right text-sm font-medium text-gray-700">Unit Price</th>
                                        <th className="border border-gray-200 px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items && invoice.items.length > 0 ? (
                                        invoice.items.map((item: InvoiceItem, index: number) => (
                                            <tr key={item.id || index} className="hover:bg-gray-50">
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                                                    {item.product?.name || item.description}
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-right text-sm text-gray-900">
                                                    {item.quantity}
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-right text-sm text-gray-900">
                                                    Rp {new Intl.NumberFormat("id-ID").format(item.unit_price)}
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                    Rp {new Intl.NumberFormat("id-ID").format(item.total_price)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="border border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
                                                No invoice items found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals Section */}
                    <div className="flex justify-end">
                        <div className="w-full max-w-sm">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="text-gray-900">
                                        Rp {new Intl.NumberFormat("id-ID").format(
                                            invoice.subtotal ||
                                            (invoice.items && invoice.items.length > 0
                                                ? invoice.items.reduce((sum, item) => sum + (item.total_price || 0), 0)
                                                : invoice.total_amount
                                            )
                                        )}
                                    </span>
                                </div>
                                {invoice.tax_amount && invoice.tax_amount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax:</span>
                                        <span className="text-gray-900">Rp {new Intl.NumberFormat("id-ID").format(invoice.tax_amount)}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-300 pt-2">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span className="text-gray-900">Total:</span>
                                        <span className="text-blue-600">Rp {new Intl.NumberFormat("id-ID").format(invoice.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
