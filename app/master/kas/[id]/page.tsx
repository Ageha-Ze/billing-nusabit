"use client";

import { useEffect, useState, use } from "react";
import { BankAccount } from "@/types";
import { useRouter } from "next/navigation"; // Use useRouter for client-side navigation/redirects
import { DataTable } from "@/components/tables/data-table";
import { transactionColumns, TransactionHistoryItem } from "../transactions-columns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BankAccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
    const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
    const [transactionsPage, setTransactionsPage] = useState(1);
    const [transactionsPageCount, setTransactionsPageCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch bank account details
                const accountResponse = await fetch(`/api/master/kas/${id}`);
                if (!accountResponse.ok) {
                    if (accountResponse.status === 404) {
                        setError("Bank Account not found.");
                        // Optionally redirect to a 404 page or list page
                        // router.push('/master/kas');
                    } else {
                        setError("Failed to fetch bank account details.");
                    }
                    setBankAccount(null);
                    setTransactions([]); // Clear transactions if account not found
                    return;
                }
                const accountData = await accountResponse.json();
                setBankAccount(accountData.data);

                // Fetch transactions for this bank account
                const transactionsResponse = await fetch(`/api/master/kas/${id}/transactions?page=${transactionsPage}&limit=10`);
                if (transactionsResponse.ok) {
                    const result = await transactionsResponse.json();
                    setTransactions(result.data || []);
                    setTransactionsPageCount(Math.ceil(result.total / result.limit));
                } else {
                    console.error("Failed to fetch transactions");
                    setTransactions([]);
                }

            } catch (err: any) {
                console.error("Error fetching data:", err);
                setError("An unexpected error occurred: " + err.message);
                setBankAccount(null);
                setTransactions([]);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [id, transactionsPage, router]);


    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(amount);
    };


    if (isLoading) {
        return <p>Loading bank account details...</p>;
    }

    if (error) {
        return <p className="text-red-600">{error}</p>;
    }

    if (!bankAccount) {
        return <p>Bank Account data not available.</p>; // Should be covered by error state
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Bank Account Details</h1>
                <Link href={`/master/kas/${bankAccount.id}/edit`}>
                    <Button>Edit Account</Button>
                </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Account Name</p>
                        <p className="font-medium">{bankAccount.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Bank Name</p>
                        <p className="font-medium">{bankAccount.bank_name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Account Number</p>
                        <p className="font-medium">{bankAccount.account_number}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Current Balance</p>
                        <p className="font-medium">{formatCurrency(bankAccount.balance)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium">{bankAccount.is_active ? 'Active' : 'Inactive'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Created At</p>
                        <p className="font-medium">{new Date(bankAccount.created_at).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Transaction History</h2>
            <DataTable 
                columns={transactionColumns} 
                data={transactions}
                pageCount={transactionsPageCount}
                page={transactionsPage}
                onPageChange={setTransactionsPage}
            />
        </div>
    )
}