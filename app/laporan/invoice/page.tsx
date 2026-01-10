"use client";

import { useEffect, useState, useMemo } from "react";
import { getColumns } from "@/app/keuangan/invoice/columns";
import { DataTable } from "@/components/tables/data-table";
import { InvoiceWithDetails } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

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

    const columns = useMemo(() => getColumns(fetchData), [fetchData]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Invoice Report</h1>
                <Link href="/laporan/invoice/export">
                    <Button>Export Report</Button>
                </Link>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <Input name="search" placeholder="Search by invoice number..." className="max-w-sm"/>
                    <Button type="submit">Search</Button>
                </form>
                {/* Status Filter */}
                <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="mt-1 block px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="">All Statuses</option>
                    <option value="UNPAID">Unpaid</option>
                    <option value="PAID">Paid</option>
                    <option value="OVERDUE">Overdue</option>
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
