"use client";

import { useEffect, useState, useMemo } from "react";
import { getColumns } from "./columns";
import { DataTable } from "@/components/tables/data-table";
import { CashFlowWithDetails, BankAccount } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CashFlowModal from "./ModalTambahTransaksi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CashFlowPage() {
    const [data, setData] = useState<CashFlowWithDetails[]>([]);
    const [pageCount, setPageCount] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState(""); // 'INCOME' | 'EXPENSE'
    const [bankAccountFilter, setBankAccountFilter] = useState(""); // Bank account ID
    const [isLoading, setIsLoading] = useState(false);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<CashFlowWithDetails | null>(null);

    const fetchBankAccounts = async () => {
        try {
            const response = await fetch('/api/master/kas');
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

    const handleOpenModal = (entry?: CashFlowWithDetails) => {
        setSelectedEntry(entry || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedEntry(null);
        setIsModalOpen(false);
        fetchData();
    };

    useEffect(() => {
        fetchBankAccounts();
    }, []);

    useEffect(() => {
        fetchData();
    }, [page, search, typeFilter, bankAccountFilter]);

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
                <h1 className="text-2xl font-bold">Daily Transactions</h1>
                <Button onClick={() => handleOpenModal()}>Add Transaction</Button>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <Input name="search" placeholder="Search by description or category..." className="max-w-sm"/>
                    <Button type="submit">Search</Button>
                </form>
                <Select onValueChange={(value) => setTypeFilter(value === "ALL" ? "" : value)} value={typeFilter || "ALL"}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Types</SelectItem>
                        <SelectItem value="INCOME">Income</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                    </SelectContent>
                </Select>
                <Select onValueChange={(value) => setBankAccountFilter(value === "ALL" ? "" : value)} value={bankAccountFilter || "ALL"}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by bank account" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Bank Accounts</SelectItem>
                        {bankAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                                {account.name} - {account.account_number}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {isLoading && <p>Loading...</p>}
            
            <DataTable 
                columns={columns} 
                data={data}
                pageCount={pageCount}
                page={page}
                onPageChange={setPage}
            />

            <CashFlowModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                cashFlowEntry={selectedEntry}
            />
        </div>
    )
}