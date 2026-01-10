"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductFormValues } from "@/lib/validations/product";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { Product } from "@/types";
import { toast } from "sonner";
import { useEffect } from "react";

interface ProdukModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

export default function ProdukModal({ isOpen, onClose, product }: ProdukModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (product) {
        reset(product);
    } else {
        reset({ name: '', type: 'HOSTING', price: 0 });
    }
  }, [product, reset]);

  const onSubmit = async (values: ProductFormValues) => {
    const result = product
      ? await updateProduct(product.id, values)
      : await createProduct(values);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Product ${product ? "updated" : "created"} successfully.`);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border shadow-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold text-gray-900 tracking-tight">
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Product Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                {...register("name")}
                className="h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-green-500/20 focus:ring-offset-0 transition-all duration-200"
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="type" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Product Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register("type")}
                className="w-full h-10 px-3 border border-gray-200 bg-gray-50/50 rounded-lg focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-green-500/20 focus:ring-offset-0 transition-all duration-200"
              >
                <option value="HOSTING">Hosting</option>
                <option value="DOMAIN">Domain</option>
                <option value="WEB">Web</option>
              </select>
              {errors.type && (
                <p className="text-red-500 text-xs mt-1.5">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="price" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Price (Rp) <span className="text-red-500">*</span>
              </label>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    className="h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-green-500/20 focus:ring-offset-0 transition-all duration-200"
                    placeholder="0.00"
                  />
                )}
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1.5">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isSubmitting ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
