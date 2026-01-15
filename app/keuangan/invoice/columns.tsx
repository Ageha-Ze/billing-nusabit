"use client";

import { ColumnDef } from "@tanstack/react-table";
import { InvoiceWithDetails } from "@/types";
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
import { deleteInvoice } from "@/lib/actions/invoices";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

const handleDelete = async (id: string, onDeleted: () => void) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
        const result = await deleteInvoice(id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Invoice deleted successfully");
            onDeleted();
        }
    }
}

export const getColumns = (onDeleted: () => void, onEdit?: (invoice: InvoiceWithDetails) => void, showActions: boolean = true): ColumnDef<InvoiceWithDetails>[] => [
  {
    accessorKey: "invoice_number",
    header: "Invoice #",
  },
  {
    accessorKey: "client.name",
    header: "Client",
  },
  {
    accessorKey: "total_amount",
    header: "Amount",
    cell: ({ row }) => {
        const amount = parseFloat(row.getValue("total_amount"))
        const formatted = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(amount)
 
        return <div className="font-medium">{formatted}</div>
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const color = status === 'PAID' ? 'text-green-600' : status === 'UNPAID' ? 'text-orange-600' : 'text-red-600';
        return <span className={color}>{status}</span>;
    }
  },
  {
    accessorKey: "due_date",
    header: "Due Date",
    cell: ({ row }) => new Date(row.original.due_date).toLocaleDateString(),
  },
  ...(showActions ? [{
    id: "actions",
    cell: function Cell({ row }: any) {
        const invoice = row.original;
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
              <DropdownMenuItem>
                <Link href={`/invoice/${invoice.id}`}>View Invoice</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(invoice)}>Edit invoice</DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDelete(invoice.id, onDeleted)}
              >
                Delete invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
  } as ColumnDef<InvoiceWithDetails>] : []),
];
