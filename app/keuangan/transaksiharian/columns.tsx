"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CashFlowWithDetails } from "@/types";
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
import { deleteCashFlowEntry } from "@/lib/actions/cashflow";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const handleDelete = async (id: number, onDeleted: () => void) => {
    if (confirm("Are you sure you want to delete this cash flow entry? (Note: Deleting will NOT reverse changes to bank account balance)")) {
        const result = await deleteCashFlowEntry(id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Cash flow entry deleted successfully");
            onDeleted();
        }
    }
}

export const getColumns = (onDeleted: () => void, onEdit?: (entry: CashFlowWithDetails) => void, showActions: boolean = true): ColumnDef<CashFlowWithDetails>[] => [
  {
    accessorKey: "tanggal",
    header: "Date",
    cell: ({ row }) => new Date(row.original.tanggal).toLocaleDateString(),
  },
  {
    accessorKey: "jenis",
    header: "Type",
    cell: ({ row }) => {
        const jenis = row.getValue("jenis") as string;
        const color = jenis === 'masuk' ? 'text-green-600' : 'text-red-600';
        const displayText = jenis === 'masuk' ? 'INCOME' : 'EXPENSE';
        return <span className={color}>{displayText}</span>;
    }
  },
  {
    accessorKey: "kategori",
    header: "Category",
  },
  {
    accessorKey: "keterangan",
    header: "Description",
  },
  {
    accessorKey: "jumlah",
    header: "Amount",
    cell: ({ row }) => {
        const amount = row.getValue("jumlah");
        const formatted = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(amount as number)

        return <div className="font-medium">{formatted}</div>
    }
  },
  {
    accessorKey: "bank_account",
    header: "Bank Account",
    cell: ({ row }) => {
        const bankAccount = row.getValue("bank_account") as { name: string; bank_name: string } | null;
        if (!bankAccount) return '-';
        return `${bankAccount.name} (${bankAccount.bank_name})`;
    }
  },
  ...(showActions ? [{
    id: "actions",
    cell: function Cell({ row }: any) {
        const entry = row.original;
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
              <DropdownMenuItem onClick={() => onEdit?.(entry)}>Edit entry</DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDelete(entry.id, onDeleted)}
              >
                Delete entry
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
  } as ColumnDef<CashFlowWithDetails>] : []),
];
