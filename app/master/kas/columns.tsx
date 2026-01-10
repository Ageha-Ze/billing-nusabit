"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BankAccount } from "@/types";
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
import { deleteBankAccount } from "@/lib/actions/kas";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const handleDelete = async (id: string, onDeleted: () => void) => {
    if (confirm("Are you sure you want to delete this bank account?")) {
        const result = await deleteBankAccount(id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Bank account deleted successfully");
            onDeleted();
        }
    }
}

export const getColumns = (onDeleted: () => void): ColumnDef<BankAccount>[] => [
  {
    accessorKey: "name",
    header: "Account Name",
  },
  {
    accessorKey: "bank_name",
    header: "Bank",
  },
  {
    accessorKey: "account_number",
    header: "Account Number",
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
        const amount = parseFloat(row.getValue("balance"))
        const formatted = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(amount)
 
        return <div className="font-medium">{formatted}</div>
    }
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
        const isActive = row.getValue("is_active");
        return isActive ? <span className="text-green-600">Active</span> : <span className="text-red-600">Inactive</span>;
    }
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
        const account = row.original;
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
                onClick={() => navigator.clipboard.writeText(account.id)}
              >
                Copy account ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/master/kas/${account.id}`)}>View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/master/kas/${account.id}/edit`)}>Edit account</DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => handleDelete(account.id, onDeleted)}
              >
                Delete account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
  },
];
