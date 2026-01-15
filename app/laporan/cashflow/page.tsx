"use client";

import { useEffect, useState, useMemo } from "react";
import { getColumns } from "@/app/keuangan/transaksiharian/columns";
import { DataTable } from "@/components/tables/data-table";
import { CashFlowWithDetails, BankAccount } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search, Download, TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react";

export default function CashFlowReportPage() {
    const [data, setData] = useState<CashFlowWithDetails[]>([]);
    const [pageCount, setPageCount] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState(""); // 'INCOME' | 'EXPENSE'
    const [bankAccountFilter, setBankAccountFilter] = useState(""); // Bank account ID
    const [startDateFilter, setStartDateFilter] = useState("");
    const [endDateFilter, setEndDateFilter] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netCashFlow: 0 });

    const fetchBankAccounts = async () => {
        try {
            const response = await fetch('/api/master/kas?limit=1000');
            if (response.ok) {
                const result = await response.json();
                setBankAccounts(result.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch bank accounts', error);
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                search,
            });
            if (typeFilter) params.append('type', typeFilter);
            if (bankAccountFilter) params.append('bank_account_id', bankAccountFilter);
            if (startDateFilter) params.append('start_date', startDateFilter);
            if (endDateFilter) params.append('end_date', endDateFilter);

            const response = await fetch(`/api/keuangan/transaksiharian?${params}`);
            const result = await response.json();
            setData(result.data || []);
            setPageCount(Math.ceil(result.total / result.limit));

            // Calculate summary
            const income = result.data?.filter((item: any) => item.jenis === 'masuk').reduce((sum: number, item: any) => sum + item.jumlah, 0) || 0;
            const expense = result.data?.filter((item: any) => item.jenis === 'keluar').reduce((sum: number, item: any) => sum + item.jumlah, 0) || 0;
            setSummary({
                totalIncome: income,
                totalExpense: expense,
                netCashFlow: income - expense
            });
        } catch (error) {
            console.error("Failed to fetch cash flow entries", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBankAccounts();
    }, []);

    useEffect(() => {
        fetchData();
    }, [page, search, typeFilter, bankAccountFilter, startDateFilter, endDateFilter]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newSearch = formData.get("search") as string;
        setPage(1);
        setSearch(newSearch);
    }

    const columns = useMemo(() => getColumns(fetchData, undefined, false), [fetchData]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Cash Flow Report</h1>
                    <p className="text-gray-600 mt-1">View and analyze daily cash flow transactions</p>
                </div>
                <Link href="/laporan/cashflow/export">
                    <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                        <Download className="w-5 h-5 mr-2" />
                        Export Report
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Transactions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">{data.length}</h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Total Income */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Income</p>
                            <h3 className="text-2xl font-bold text-green-600 mt-2">
                                Rp {new Intl.NumberFormat("id-ID").format(summary.totalIncome)}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Total Expense */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Expense</p>
                            <h3 className="text-2xl font-bold text-red-600 mt-2">
                                Rp {new Intl.NumberFormat("id-ID").format(summary.totalExpense)}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <TrendingDown className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Net Cash Flow */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Net Cash Flow</p>
                            <h3 className={`text-2xl font-bold mt-2 ${summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Rp {new Intl.NumberFormat("id-ID").format(Math.abs(summary.netCashFlow))}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <DollarSign className={`w-6 h-6 ${summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
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
                        placeholder="Search by description or category..."
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="block px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        >
                            <option value="">All Types</option>
                            <option value="INCOME">Income</option>
                            <option value="EXPENSE">Expense</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
                        <select
                            value={bankAccountFilter}
                            onChange={(e) => setBankAccountFilter(e.target.value)}
                            className="block px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        >
                            <option value="">All Bank Accounts</option>
                            {bankAccounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name} - {account.account_number}
                                </option>
                            ))}
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
                        <p className="text-gray-500">Loading cash flow data...</p>
                    </div>
                </div>
            )}

            {/* Table Card */}
            {!isLoading && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">All Cash Flow Entries</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Showing {data.length} cash flow records
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
