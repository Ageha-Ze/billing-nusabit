"use client";

import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/tables/data-table";
import { Client } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ClientModal from "./ClientModal";
import { Search, Plus, Users, UserCheck, TrendingUp, Clock } from "lucide-react";

export default function ClientPage() {
    const [data, setData] = useState<Client[]>([]);
    const [pageCount, setPageCount] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        thisMonth: 0,
        activeClients: 0,
        growth: 0
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const handleOpenModal = (client?: Client) => {
        setSelectedClient(client || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedClient(null);
        setIsModalOpen(false);
        fetchData();
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/master/client?page=${page}&limit=10&search=${search}`);
            const result = await response.json();
            setData(result.data || []);
            setPageCount(Math.ceil(result.total / result.limit));
            
            // Calculate stats (mock calculation - adjust based on your actual data)
            const total = result.total || 0;
            const thisMonth = result.data?.filter((c: Client) => {
                const createdDate = new Date(c.created_at);
                const now = new Date();
                return createdDate.getMonth() === now.getMonth() && 
                       createdDate.getFullYear() === now.getFullYear();
            }).length || 0;
            
            setStats({
                total,
                thisMonth,
                activeClients: Math.floor(total * 0.85), // 85% active (mock)
                growth: 12.5 // Mock growth percentage
            });
        } catch (error) {
            console.error("Failed to fetch clients", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, search]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
                    <p className="text-gray-600 mt-1">Manage and organize your client database</p>
                </div>
                <Button 
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Client
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Clients */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Clients</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* New This Month */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">New This Month</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">{stats.thisMonth}</h3>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Active Clients */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Clients</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">{stats.activeClients}</h3>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* Growth Rate */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">+{stats.growth}%</h3>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <span className="text-xs text-green-600 font-medium">↑ {stats.growth}%</span>
                        <span className="text-xs text-gray-500 ml-1">vs last month</span>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                        name="search" 
                        placeholder="Search by name or email..." 
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
                        <p className="text-gray-500">Loading clients...</p>
                    </div>
                </div>
            )}
            
            {/* Table Card */}
            {!isLoading && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">All Clients</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Showing {data.length} of {stats.total} clients
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
            <ClientModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                client={selectedClient}
            />
        </div>
    )
}

