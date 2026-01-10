"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PaymentWithDetails } from "@/types";
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
import { deletePayment } from "@/lib/actions/payments";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const handleDelete = async (id: string, onDeleted: () => void) => {
    if (confirm("Are you sure you want to delete this payment? Note: Deleting a payment does NOT reverse its effects on invoice status, bank balance, or cash flow entries.")) {
        const result = await deletePayment(id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Payment deleted successfully");
            onDeleted();
        }
    }
}

export const getColumns = (onDeleted: () => void, onEdit?: (payment: PaymentWithDetails) => void): ColumnDef<PaymentWithDetails>[] => [
  {
    accessorKey: "invoice.invoice_number",
    header: "Invoice #",
  },
  {
    accessorKey: "bank_account.name",
    header: "Bank Account",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"))
        const formatted = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(amount)
 
        return <div className="font-medium">{formatted}</div>
    }
  },
  {
    accessorKey: "method",
    header: "Method",
  },
  {
    accessorKey: "payment_date",
    header: "Payment Date",
    cell: ({ row }) => new Date(row.original.payment_date).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
        const payment = row.original;
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
              <DropdownMenuItem onClick={() => onEdit?.(payment)}>Edit payment</DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => handleDelete(payment.id, onDeleted)}
              >
                Delete payment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
  },
];
