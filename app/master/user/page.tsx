"use client";

import { useEffect, useState, useMemo } from "react";
import { getColumns } from "./columns";
import { DataTable } from "@/components/tables/data-table";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserModal from "./UserModal";
import { Search, Plus, Users, UserCheck, Shield } from "lucide-react";

export default function UserPage() {
    const [data, setData] = useState<User[]>([]);
    const [pageCount, setPageCount] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/master/user?page=${page}&limit=10&search=${search}`);
            const result = await response.json();
            setData(result.data || []);
            setPageCount(Math.ceil(result.total / result.limit));
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (user?: User) => {
        setSelectedUser(user || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
        setIsModalOpen(false);
        fetchData();
    };

    useEffect(() => {
        fetchData();
    }, [page, search]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newSearch = formData.get("search") as string;
        setPage(1);
        setSearch(newSearch);
    }

    const columns = useMemo(() => getColumns(fetchData), [fetchData]);

    // Calculate stats
    const totalUsers = data.length;
    const activeUsers = data.filter(user => user.is_active).length;
    const adminUsers = data.filter(user => user.role === 'ADMIN').length;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600 mt-1">Manage system users and their access permissions</p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add User
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Users */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">{totalUsers}</h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Active Users */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Users</p>
                            <h3 className="text-2xl font-bold text-green-600 mt-2">{activeUsers}</h3>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Admin Users */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Admin Users</p>
                            <h3 className="text-2xl font-bold text-purple-600 mt-2">{adminUsers}</h3>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-purple-600" />
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
                        placeholder="Search by name or email..."
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
                        <p className="text-gray-500">Loading users...</p>
                    </div>
                </div>
            )}

            {/* Table Card */}
            {!isLoading && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Showing {data.length} user records
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
            <UserModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                user={selectedUser}
            />
        </div>
    )
}
