"use client";

import { useEffect, useState, useMemo } from "react";
import { getColumns } from "./columns";
import { DataTable } from "@/components/tables/data-table";
import { PaymentWithDetails } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PaymentModal from "./ModalTambahPayment";
import { Search, Plus, CreditCard, DollarSign } from "lucide-react";

export default function PaymentPage() {
    const [data, setData] = useState<PaymentWithDetails[]>([]);
    const [pageCount, setPageCount] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/keuangan/payment?page=${page}&limit=10&search=${search}`);
            const result = await response.json();
            setData(result.data || []);
            setPageCount(Math.ceil(result.total / result.limit));
        } catch (error) {
            console.error("Failed to fetch payments", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (payment?: PaymentWithDetails) => {
        setSelectedPayment(payment || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedPayment(null);
        setIsModalOpen(false);
        fetchData();
    };

    useEffect(() => {
        fetchData();
    }, [page, search]);

    const columns = useMemo(() => getColumns(fetchData, handleOpenModal), [page, search]);

    // Calculate stats
    const totalAmount = data.reduce((sum, payment) => sum + (parseFloat(payment.amount.toString()) || 0), 0);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
                    <p className="text-gray-600 mt-1">Track and manage client payment records</p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Record Payment
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Payments */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Payments</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">{data.length}</h3>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-green-600" />
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
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-blue-600" />
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
                        placeholder="Search by invoice number, client, or bank account..."
                        className="pl-10 border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500">Loading payments...</p>
                    </div>
                </div>
            )}

            {/* Table Card */}
            {!isLoading && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">All Payments</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Showing {data.length} payment records
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

            {/* Modal */}
            <PaymentModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                payment={selectedPayment}
            />
        </div>
    )
}
