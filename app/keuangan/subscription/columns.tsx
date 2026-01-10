"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SubscriptionWithDetails } from "@/types";
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
import { deleteSubscription } from "@/lib/actions/subscriptions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const handleDelete = async (id: string, onDeleted: () => void) => {
    if (confirm("Are you sure you want to delete this subscription?")) {
        const result = await deleteSubscription(id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Subscription deleted successfully");
            onDeleted();
        }
    }
}

export const getColumns = (onDeleted: () => void): ColumnDef<SubscriptionWithDetails>[] => [
  {
    accessorKey: "client.name",
    header: "Client",
  },
  {
    accessorKey: "product.name",
    header: "Product",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const color = status === 'ACTIVE' ? 'text-green-600' : status === 'EXPIRED' ? 'text-red-600' : 'text-gray-600';
        return <span className={color}>{status}</span>;
    }
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) => new Date(row.original.start_date).toLocaleDateString(),
  },
  {
    accessorKey: "expiry_date",
    header: "Expiry Date",
    cell: ({ row }) => new Date(row.original.expiry_date).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
        const subscription = row.original;
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
              <DropdownMenuItem onClick={() => router.push(`/keuangan/subscription/${subscription.id}`)}>View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/keuangan/subscription/${subscription.id}/edit`)}>Edit subscription</DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => handleDelete(subscription.id, onDeleted)}
              >
                Delete subscription
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
  },
];
