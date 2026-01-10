"use client";

import { ColumnDef } from "@tanstack/react-table";

export type TransactionHistoryItem = {
    id: string;
    date: string;
    description: string;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    amount: number;
}

export const transactionColumns: ColumnDef<TransactionHistoryItem>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
        const type = row.getValue("type") as string;
        const color = type === 'INCOME' ? 'text-green-600' : 'text-red-600';
        return <span className={color}>{type}</span>;
    }
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "description",
    header: "Description",
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
];
