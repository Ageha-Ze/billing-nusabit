"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteUser } from "@/lib/actions/users";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const handleDelete = async (id: string, onDeleted: () => void) => {
    if (confirm("Are you sure you want to delete this user?")) {
        const result = await deleteUser(id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("User deleted successfully");
            onDeleted();
        }
    }
}

export const getColumns = (onDeleted: () => void): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "is_active",
    header: "Active",
    cell: ({ row }) => {
        const isActive = row.getValue("is_active");
        return isActive ? <span className="text-green-600">Yes</span> : <span className="text-red-600">No</span>;
    }
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return date.toLocaleDateString();
    }
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
        const user = row.original;
        const router = useRouter();
   
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.id)}
              >
                Copy user ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => alert("Edit not implemented")}>Edit user</DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => handleDelete(user.id, onDeleted)}
              >
                Delete user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
  },
];