"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subscriptionSchema, SubscriptionFormValues } from "@/lib/validations/subscription";
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
import { createSubscription, updateSubscription } from "@/lib/actions/subscriptions";
import { Subscription, Client, Product } from "@/types";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription?: Subscription | null;
}

export default function SubscriptionModal({ isOpen, onClose, subscription }: SubscriptionModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema),
  });
  
  useEffect(() => {
    async function fetchData() {
        try {
            const [clientRes, productRes] = await Promise.all([
                fetch('/api/master/client?limit=1000'),
                fetch('/api/master/produk?limit=1000')
            ]);
            const clientData = await clientRes.json();
            const productData = await productRes.json();
            setClients(clientData.data || []);
            setProducts(productData.data || []);
        } catch (error) {
            console.error("Failed to fetch clients or products", error);
        }
    }
    fetchData();
  }, [])

  useEffect(() => {
    if (subscription) {
        reset({
            ...subscription,
            start_date: new Date(subscription.start_date).toISOString().split('T')[0],
            expiry_date: new Date(subscription.expiry_date).toISOString().split('T')[0],
        });
    } else {
        reset({ 
            client_id: '', 
            product_id: '',
            status: 'ACTIVE',
            start_date: new Date().toISOString().split('T')[0],
            expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        });
    }
  }, [subscription, reset]);

  const onSubmit = async (values: SubscriptionFormValues) => {
    const result = subscription
      ? await updateSubscription(subscription.id, {
        ...values,
        package_details: values.package_details === undefined ? null : values.package_details,
      })
      : await createSubscription({
        ...values,
        package_details: values.package_details === undefined ? null : values.package_details,
      });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Subscription ${subscription ? "updated" : "created"} successfully.`);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border shadow-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold text-gray-900 tracking-tight">
            {subscription ? "Edit Subscription" : "Add New Subscription"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="client_id" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                {...register("client_id")}
                className="w-full h-10 px-3 border border-gray-200 bg-gray-50/50 rounded-lg focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-0 transition-all duration-200"
              >
                <option value="">Select a client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.client_id && (
                <p className="text-red-500 text-xs mt-1.5">{errors.client_id.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="product_id" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Product <span className="text-red-500">*</span>
              </label>
              <select
                {...register("product_id")}
                className="w-full h-10 px-3 border border-gray-200 bg-gray-50/50 rounded-lg focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-0 transition-all duration-200"
              >
                <option value="">Select a product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.product_id && (
                <p className="text-red-500 text-xs mt-1.5">{errors.product_id.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="status" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Subscription Status <span className="text-red-500">*</span>
              </label>
              <select
                {...register("status")}
                className="w-full h-10 px-3 border border-gray-200 bg-gray-50/50 rounded-lg focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-0 transition-all duration-200"
              >
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-xs mt-1.5">{errors.status.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="start_date" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Start Date <span className="text-red-500">*</span>
              </label>
              <Input
                id="start_date"
                type="date"
                {...register("start_date")}
                className="h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-0 transition-all duration-200"
              />
              {errors.start_date && (
                <p className="text-red-500 text-xs mt-1.5">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="expiry_date" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <Input
                id="expiry_date"
                type="date"
                {...register("expiry_date")}
                className="h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-0 transition-all duration-200"
              />
              {errors.expiry_date && (
                <p className="text-red-500 text-xs mt-1.5">{errors.expiry_date.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="package_details" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Package Details (Optional)
              </label>
              <Input
                id="package_details"
                {...register("package_details")}
                className="h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-0 transition-all duration-200"
                placeholder="Additional package information"
              />
              {errors.package_details && (
                <p className="text-red-500 text-xs mt-1.5">{errors.package_details.message}</p>
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
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isSubmitting ? "Saving..." : "Save Subscription"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
