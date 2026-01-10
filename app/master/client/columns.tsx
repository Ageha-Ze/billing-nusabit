// ==========================================
// FILE 3: columns.tsx
// Path: /master/client/columns.tsx
// ==========================================
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Client } from "@/types";
import { MoreVertical, Trash2, Edit, Eye, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteClient } from "@/lib/actions/clients";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
        const result = await deleteClient(id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Client deleted successfully");
            window.location.reload();
        }
    }
}

export const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "name",
    header: () => (
      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
        Name
      </div>
    ),
    cell: ({ row }) => (
      <div className="font-medium text-gray-900">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "email",
    header: () => (
      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
        Email
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-gray-600">{row.original.email}</div>
    ),
  },
  {
    accessorKey: "phone_wa",
    header: () => (
      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
        Phone
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-gray-600">{row.original.phone_wa || "-"}</div>
    ),
  },
  {
    accessorKey: "created_at",
    header: () => (
      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
        Created
      </div>
    ),
    cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return (
          <div className="text-gray-600">
            {date.toLocaleDateString('id-ID')}
          </div>
        );
    }
  },
  {
    id: "actions",
    header: () => (
      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider text-right">
        Actions
      </div>
    ),
    cell: function Cell({ row }) {
        const client = row.original;
        const router = useRouter();
   
        return (
          <div className="text-right">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-5 w-5 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border shadow-lg w-48">
                <DropdownMenuLabel className="font-semibold text-gray-900">
                  Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(client.id);
                    toast.success("Client ID copied to clipboard");
                  }}
                  className="hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => router.push(`/master/client/${client.id}`)} 
                  className="hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => router.push(`/master/client/${client.id}/edit`)} 
                  className="hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Client
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-2"
                  onClick={() => handleDelete(client.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
  },
];
