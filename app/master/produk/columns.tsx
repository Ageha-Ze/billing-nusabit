"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/types";
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
import { deleteProduct } from "@/lib/actions/products";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const handleDelete = async (id: string, onDeleted: () => void) => {
    if (confirm("Are you sure you want to delete this product?")) {
        const result = await deleteProduct(id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Product deleted successfully");
            onDeleted();
        }
    }
}

export const getColumns = (onDeleted: () => void): ColumnDef<Product>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
        const amount = parseFloat(row.getValue("price"))
        const formatted = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(amount)
 
        return <div className="font-medium">{formatted}</div>
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
        const product = row.original;
        const router = useRouter();
   
        return (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border shadow-lg">
              <DropdownMenuLabel className="font-semibold">Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(product.id)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                Copy product ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/master/produk/${product.id}`)} className="hover:bg-gray-50 cursor-pointer">View details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/master/produk/${product.id}/edit`)} className="hover:bg-gray-50 cursor-pointer">Edit product</DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 hover:bg-red-50 cursor-pointer"
                onClick={() => handleDelete(product.id, onDeleted)}
              >
                Delete product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
  },
];
