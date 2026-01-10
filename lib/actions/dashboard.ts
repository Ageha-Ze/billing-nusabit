"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { InvoiceWithDetails } from "@/types";

type RecentActivity = Pick<InvoiceWithDetails, 'invoice_number' | 'created_at' | 'total_amount' | 'status'> & { client: { name: string } };

interface DashboardStats {
    totalClients: number;
    activeSubscriptions: number;
    totalUnpaidAmount: number;
    netCashFlow: number;
    recentActivity: RecentActivity[];
    error: string | null;
}

export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        // Total Clients
        const { count: totalClients, error: clientsError } = await supabaseAdmin
            .from('clients')
            .select('*', { count: 'exact', head: true });
        if (clientsError) throw clientsError;

        // Active Subscriptions
        const { count: activeSubscriptions, error: subscriptionsError } = await supabaseAdmin
            .from('subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'ACTIVE');
        if (subscriptionsError) throw subscriptionsError;

        // Unpaid Invoices (total amount)
        const { data: unpaidInvoicesSum, error: unpaidInvoicesError } = await supabaseAdmin
            .from('invoices')
            .select('total_amount')
            .eq('status', 'UNPAID');
        
        let totalUnpaidAmount = 0;
        if (unpaidInvoicesError) {
            console.error("Error fetching unpaid invoices sum:", unpaidInvoicesError);
            // Don't throw, just set to 0
        } else if (unpaidInvoicesSum) {
            totalUnpaidAmount = unpaidInvoicesSum.reduce((sum, invoice) => sum + parseFloat(invoice.total_amount.toString()), 0);
        }

        // Net Cash Flow (e.g., for the current month)
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();

        const { data: cashFlowData, error: cashFlowError } = await supabaseAdmin
            .from('cash_flow')
            .select('type, amount')
            .gte('date', firstDayOfMonth)
            .lte('date', lastDayOfMonth);

        let totalIncome = 0;
        let totalExpense = 0;
        if (cashFlowError) {
            console.error("Error fetching cash flow data:", cashFlowError);
            // Don't throw, just set to 0
        } else if (cashFlowData) {
            cashFlowData.forEach(entry => {
                if (entry.type === 'INCOME') {
                    totalIncome += parseFloat(entry.amount.toString());
                } else if (entry.type === 'EXPENSE') {
                    totalExpense += parseFloat(entry.amount.toString());
                }
            });
        }
        const netCashFlow = totalIncome - totalExpense;


        // Recent Activity (e.g., last 5 invoices)
        const { data: recentInvoices, error: recentInvoicesError } = await supabaseAdmin
            .from('invoices')
            .select(`
                invoice_number, created_at, total_amount, status,
                client:clients(name)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        if (recentInvoicesError) console.error("Error fetching recent invoices:", recentInvoicesError);

        // Transform the data to match the expected interface
        const recentActivity = (recentInvoices || []).map(invoice => {
            const clientData = Array.isArray(invoice.client) ? invoice.client[0] : invoice.client;
            return {
                invoice_number: invoice.invoice_number,
                created_at: invoice.created_at,
                total_amount: invoice.total_amount,
                status: invoice.status,
                client: {
                    name: clientData?.name || 'Unknown'
                }
            };
        });

        return {
            totalClients: totalClients || 0,
            activeSubscriptions: activeSubscriptions || 0,
            totalUnpaidAmount,
            netCashFlow,
            recentActivity,
            error: null,
        };

    } catch (error: any) {
        console.error("Error fetching dashboard stats:", error);
        return {
            totalClients: 0,
            activeSubscriptions: 0,
            totalUnpaidAmount: 0,
            netCashFlow: 0,
            recentActivity: [],
            error: error.message,
        };
    }
}
