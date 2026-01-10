"use client";

import { useEffect, useState, useMemo } from "react";
import { getColumns } from "./columns";
import { DataTable } from "@/components/tables/data-table";
import { SubscriptionWithDetails } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SubscriptionModal from "./ModalTambahSubscription";
import { Search, Plus, Calendar } from "lucide-react";

export default function SubscriptionPage() {
    const [data, setData] = useState<SubscriptionWithDetails[]>([]);
    const [pageCount, setPageCount] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionWithDetails | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/keuangan/subscription?page=${page}&limit=10&search=${search}`);
            const result = await response.json();
            setData(result.data || []);
            setPageCount(Math.ceil(result.total / result.limit));
        } catch (error) {
            console.error("Failed to fetch subscriptions", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (subscription?: SubscriptionWithDetails) => {
        setSelectedSubscription(subscription || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedSubscription(null);
        setIsModalOpen(false);
        fetchData();
    };

    useEffect(() => {
        fetchData();
    }, [page, search]);

    const columns = useMemo(() => getColumns(fetchData), [page, search]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
                    <p className="text-gray-600 mt-1">Manage client subscriptions and billing cycles</p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Subscription
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Subscriptions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">{data.length}</h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-blue-600" />
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
                        placeholder="Search by client, product, or status..."
                        className="pl-10 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500">Loading subscriptions...</p>
                    </div>
                </div>
            )}

            {/* Table Card */}
            {!isLoading && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">All Subscriptions</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Showing {data.length} subscriptions
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
            <SubscriptionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                subscription={selectedSubscription}
            />
        </div>
    )
}
