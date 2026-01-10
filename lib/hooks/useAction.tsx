"use client"
import { deleteClient } from "@/lib/actions/clients"
import { toast } from "sonner"

export type Action = "view" | "edit" | "delete"

export const useAction = () => {
  const del = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      const result = await deleteClient(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Item deleted successfully.")
      }
    }
  }

  const columns = (columns: any) => {
    return columns.map((col: any) => {
      if (col.id === "actions") {
        return {
          ...col,
          cell: ({ row }: any) => {
            const { id } = row.original
            return col.cell({
              ...row,
              del: () => del(id),
            })
          },
        }
      }
      return col
    })
  }

  return { columns }
}