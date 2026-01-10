"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { Card } from "@/components/ui/card"; // Assuming Card component exists
import { DollarSign, Users, RefreshCw, XCircle } from "lucide-react";
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

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            setIsLoading(true);
            const result = await getDashboardStats();
            setStats(result);
            setIsLoading(false);
        }
        fetchStats();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(amount);
    };

    if (isLoading) {
        return <p>Loading dashboard...</p>;
    }

    if (stats?.error) {
        return <p className="text-red-600">Error loading dashboard: {stats.error}</p>;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Last updated</p>
                        <p className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card-modern p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Clients</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.totalClients}</p>
                            <p className="text-xs text-gray-500 mt-1">Active accounts</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Users className="text-blue-600 h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="card-modern p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Active Subscriptions</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.activeSubscriptions}</p>
                            <p className="text-xs text-green-600 mt-1">↑ 12% from last month</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-xl">
                            <RefreshCw className="text-green-600 h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="card-modern p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Unpaid Invoices</p>
                            <p className="text-3xl font-bold text-red-600">{formatCurrency(stats?.totalUnpaidAmount || 0)}</p>
                            <p className="text-xs text-gray-500 mt-1">Requires attention</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-xl">
                            <XCircle className="text-red-600 h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="card-modern p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Net Cash Flow</p>
                            <p className={`text-3xl font-bold ${stats?.netCashFlow && stats.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(stats?.netCashFlow || 0)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">This month</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-xl">
                            <DollarSign className="text-purple-600 h-6 w-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card-modern p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Recent Invoices</h2>
                    <span className="badge-info-modern">Last 10 transactions</span>
                </div>

                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                    <div className="space-y-4">
                        {stats.recentActivity.map((activity, index) => (
                            <div key={activity.invoice_number + index} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${
                                        activity.status === 'PAID' ? 'bg-green-500' :
                                        activity.status === 'UNPAID' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}></div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{activity.invoice_number}</p>
                                        <p className="text-sm text-gray-600">{activity.client?.name}</p>
                                        <p className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">{formatCurrency(parseFloat(activity.total_amount.toString()))}</p>
                                    <span className={`badge-modern ${
                                        activity.status === 'PAID' ? 'badge-success-modern' :
                                        activity.status === 'UNPAID' ? 'badge-warning-modern' : 'badge-danger-modern'
                                    }`}>
                                        {activity.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">
                            <DollarSign className="w-12 h-12 mx-auto opacity-50" />
                        </div>
                        <p className="text-gray-500">No recent activity found.</p>
                        <p className="text-sm text-gray-400 mt-1">New transactions will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
}