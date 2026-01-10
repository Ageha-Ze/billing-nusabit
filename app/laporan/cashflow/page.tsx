"use client";

import { useEffect, useState, useMemo } from "react";
import { getColumns } from "@/app/keuangan/transaksiharian/columns";
import { DataTable } from "@/components/tables/data-table";
import { CashFlowWithDetails, BankAccount } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Download } from "lucide-react";

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

    const columns = useMemo(() => getColumns(fetchData), [fetchData]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Cash Flow Report</h1>
                <Link href="/laporan/cashflow/export">
                    <Button>
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                </Link>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <Input name="search" placeholder="Search by description or category..." className="max-w-sm"/>
                    <Button type="submit">Search</Button>
                </form>
                {/* Type Filter */}
                <select 
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="mt-1 block px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="">All Types</option>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                </select>

                {/* Bank Account Filter */}
                <select 
                    value={bankAccountFilter} 
                    onChange={(e) => setBankAccountFilter(e.target.value)}
                    className="mt-1 block px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="">All Bank Accounts</option>
                    {bankAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                            {account.name} - {account.account_number}
                        </option>
                    ))}
                </select>

                {/* Date Range Filter */}
                <Input 
                    type="date" 
                    placeholder="Start Date" 
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    className="max-w-xs"
                />
                <Input 
                    type="date" 
                    placeholder="End Date" 
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    className="max-w-xs"
                />
            </div>

            {isLoading && <p>Loading...</p>}
            
            <DataTable 
                columns={columns} 
                data={data}
                pageCount={pageCount}
                page={page}
                onPageChange={setPage}
            />
        </div>
    )
}