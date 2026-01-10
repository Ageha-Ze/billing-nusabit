"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, InvoiceFormValues } from "@/lib/validations/invoice";
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
import { createInvoice, updateInvoice } from "@/lib/actions/invoices";
import { Invoice, Client, SubscriptionWithDetails } from "@/types";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice | null;
}

export default function InvoiceModal({ isOpen, onClose, invoice }: InvoiceModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithDetails[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
  });

  const selectedClientId = watch('client_id');
  const selectedSubscriptionId = watch('subscription_id');

  useEffect(() => {
    async function fetchData() {
        try {
            const [clientRes, subscriptionRes] = await Promise.all([
                fetch('/api/master/client?limit=1000'),
                fetch('/api/keuangan/subscription?limit=1000')
            ]);
            const clientData = await clientRes.json();
            const subscriptionData = await subscriptionRes.json();
            setClients(clientData.data || []);
            setSubscriptions(subscriptionData.data || []);
        } catch (error) {
            console.error("Failed to fetch clients or subscriptions", error);
        }
    }
    fetchData();
  }, [])

  useEffect(() => {
    if (invoice) {
        reset({
            ...invoice,
            due_date: new Date(invoice.due_date).toISOString().split('T')[0],
            total_amount: parseFloat(invoice.total_amount.toString()),
        });
    } else {
        reset({ 
            client_id: '', 
            subscription_id: null,
            total_amount: 0,
            due_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0], // 7 days from now
            status: 'UNPAID',
        });
    }
  }, [invoice, reset]);

  useEffect(() => {
    // Only set default total_amount from subscription when creating new invoice
    // Don't override manually entered amounts when editing
    if (!invoice) {
      const sub = subscriptions.find(s => s.id === selectedSubscriptionId);
      if (sub && sub.product && sub.product.price) {
          setValue('total_amount', parseFloat(sub.product.price.toString()));
      } else if (!selectedSubscriptionId) {
          setValue('total_amount', 0);
      }
    }
  }, [selectedSubscriptionId, subscriptions, invoice]);


  const onSubmit = async (values: InvoiceFormValues) => {
    const result = invoice
      ? await updateInvoice(invoice.id, {
        ...values,
        subscription_id: values.subscription_id === '' || values.subscription_id === undefined ? null : values.subscription_id,
      })
      : await createInvoice({
        ...values,
        subscription_id: values.subscription_id === '' || values.subscription_id === undefined ? null : values.subscription_id,
      });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Invoice ${invoice ? "updated" : "created"} successfully.`);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border shadow-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold text-gray-900 tracking-tight">
            {invoice ? "Edit Invoice" : "Add New Invoice"}
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
                className="w-full h-10 px-3 border border-gray-200 bg-gray-50/50 rounded-lg focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 transition-all duration-200"
              >
                <option value="">Select a client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.client_id && (
                <p className="text-red-500 text-xs mt-1.5">{errors.client_id.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="subscription_id" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Subscription (Optional)
              </label>
              <select
                {...register("subscription_id")}
                className="w-full h-10 px-3 border border-gray-200 bg-gray-50/50 rounded-lg focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 transition-all duration-200"
              >
                <option value="">Select a subscription</option>
                {subscriptions.filter(s => s.client.email === clients.find(c => c.id === selectedClientId)?.email).map(s => (
                  <option key={s.id} value={s.id}>
                    {s.product.name} (Client: {s.client.name})
                  </option>
                ))}
              </select>
              {errors.subscription_id && (
                <p className="text-red-500 text-xs mt-1.5">{errors.subscription_id.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="total_amount" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Total Amount (Rp) <span className="text-red-500">*</span>
              </label>
              <Controller
                name="total_amount"
                control={control}
                render={({ field }) => (
                  <Input
                    id="total_amount"
                    type="number"
                    step="0.01"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    className="h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 transition-all duration-200"
                    placeholder="0.00"
                  />
                )}
              />
              {errors.total_amount && (
                <p className="text-red-500 text-xs mt-1.5">{errors.total_amount.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="due_date" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Due Date <span className="text-red-500">*</span>
              </label>
              <Input
                id="due_date"
                type="date"
                {...register("due_date")}
                className="h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 transition-all duration-200"
              />
              {errors.due_date && (
                <p className="text-red-500 text-xs mt-1.5">{errors.due_date.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="status" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Payment Status <span className="text-red-500">*</span>
              </label>
              <select
                {...register("status")}
                className="w-full h-10 px-3 border border-gray-200 bg-gray-50/50 rounded-lg focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 transition-all duration-200"
              >
                <option value="UNPAID">Unpaid</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-xs mt-1.5">{errors.status.message}</p>
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
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isSubmitting ? "Saving..." : "Save Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
