"use client";

import { useEffect, useState, useMemo } from "react";
import { getColumns } from "./columns";
import { DataTable } from "@/components/tables/data-table";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserModal from "./UserModal";

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

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">User Management</h1>
                <Button onClick={() => handleOpenModal()}>Add User</Button>
            </div>
            
            <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
                <Input name="search" placeholder="Search by name or email..." className="max-w-sm"/>
                <Button type="submit">Search</Button>
            </form>

            {isLoading && <p>Loading...</p>}
            
            <DataTable 
                columns={columns} 
                data={data}
                pageCount={pageCount}
                page={page}
                onPageChange={setPage}
            />

            <UserModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                user={selectedUser}
            />
        </div>
    )
}