"use client";

import { useEffect, useState, useMemo } from "react";
import { getColumns } from "@/app/keuangan/invoice/columns";
import { DataTable } from "@/components/tables/data-table";
import { InvoiceWithDetails } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search, Download, FileText, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function InvoiceReportPage() {
    const [data, setData] = useState<InvoiceWithDetails[]>([]);
    const [pageCount, setPageCount] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState(""); // UNPAID, PAID, OVERDUE
    const [startDateFilter, setStartDateFilter] = useState("");
    const [endDateFilter, setEndDateFilter] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                search,
            });
            if (statusFilter) params.append('status', statusFilter);
            if (startDateFilter) params.append('start_date', startDateFilter);
            if (endDateFilter) params.append('end_date', endDateFilter);

            const response = await fetch(`/api/keuangan/invoice?${params}`);
            const result = await response.json();
            setData(result.data || []);
            setPageCount(Math.ceil(result.total / result.limit));
        } catch (error) {
            console.error("Failed to fetch invoices", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, search, statusFilter, startDateFilter, endDateFilter]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newSearch = formData.get("search") as string;
        setPage(1);
        setSearch(newSearch);
    }

    const columns = useMemo(() => getColumns(fetchData, undefined, false), [fetchData]);

    // Calculate stats
    const totalInvoices = data.length;
    const totalAmount = data.reduce((sum, invoice) => sum + (parseFloat(invoice.total_amount?.toString()) || 0), 0);
    const paidInvoices = data.filter(invoice => invoice.status === 'PAID').length;
    const unpaidInvoices = data.filter(invoice => invoice.status === 'UNPAID').length;
    const overdueInvoices = data.filter(invoice => invoice.status === 'OVERDUE').length;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Invoice Report</h1>
                    <p className="text-gray-600 mt-1">Track and analyze invoice records and payment status</p>
                </div>
                <Link href="/laporan/invoice/export">
                    <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                        <Download className="w-5 h-5 mr-2" />
                        Export Report
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Invoices */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">{totalInvoices}</h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Total Amount */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Amount</p>
                            <h3 className="text-2xl font-bold text-green-600 mt-2">
                                Rp {new Intl.NumberFormat("id-ID").format(totalAmount)}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Paid Invoices */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
                            <h3 className="text-2xl font-bold text-green-600 mt-2">{paidInvoices}</h3>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Pending/Overdue */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending/Overdue</p>
                            <h3 className="text-2xl font-bold text-orange-600 mt-2">{unpaidInvoices + overdueInvoices}</h3>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        name="search"
                        placeholder="Search by invoice number, client, or amount..."
                        className="pl-10 border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="block px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        >
                            <option value="">All Statuses</option>
                            <option value="UNPAID">Unpaid</option>
                            <option value="PAID">Paid</option>
                            <option value="OVERDUE">Overdue</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <Input
                            type="date"
                            value={startDateFilter}
                            onChange={(e) => setStartDateFilter(e.target.value)}
                            className="block px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <Input
                            type="date"
                            value={endDateFilter}
                            onChange={(e) => setEndDateFilter(e.target.value)}
                            className="block px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500">Loading invoices...</p>
                    </div>
                </div>
            )}

            {/* Table Card */}
            {!isLoading && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">All Invoices</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Showing {data.length} invoice records
                        </p>
                    </div>
                    <DataTable
                        columns={columns}
                        data={data}
                        pageCount={pageCount}
                        page={page}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </div>
    )
}
