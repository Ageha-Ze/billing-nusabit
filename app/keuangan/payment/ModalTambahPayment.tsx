"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, PaymentFormValues } from "@/lib/validations/payment";
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
import { createPayment, updatePayment } from "@/lib/actions/payments";
import { Payment, InvoiceWithDetails, BankAccount } from "@/types";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment?: Payment | null; // For editing, though logic for side-effects of editing is complex
}

export default function PaymentModal({ isOpen, onClose, payment }: PaymentModalProps) {
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
  });

  const selectedInvoiceId = watch('invoice_id');

  useEffect(() => {
    async function fetchData() {
        try {
            const [invoiceRes, bankAccountRes] = await Promise.all([
                // Fetch only UNPAID invoices for selection, or all for editing
                payment ? fetch('/api/keuangan/invoice?limit=1000') : fetch('/api/keuangan/invoice?limit=1000&status=UNPAID'),
                fetch('/api/master/kas?limit=1000')
            ]);
            const invoiceData = await invoiceRes.json();
            const bankAccountData = await bankAccountRes.json();
            setInvoices(invoiceData.data || []);
            setBankAccounts(bankAccountData.data || []);
        } catch (error) {
            console.error("Failed to fetch invoices or bank accounts", error);
        }
    }
    fetchData();
  }, [payment])

  useEffect(() => {
    if (payment) {
        // Pre-fill for editing
        reset({
            invoice_id: payment.invoice_id,
            bank_account_id: payment.bank_account_id,
            amount: payment.amount,
            method: payment.method,
            notes: payment.notes || '',
        });
    } else {
        reset({
            invoice_id: '',
            bank_account_id: '',
            amount: 0,
            method: 'MANUAL',
            notes: '',
        });
    }
  }, [payment, reset]);

  // Set amount based on selected invoice's total_amount (only for new payments)
  useEffect(() => {
    if (!payment && selectedInvoiceId) {
        const inv = invoices.find(i => i.id === selectedInvoiceId);
        if (inv && inv.total_amount) {
            setValue('amount', parseFloat(inv.total_amount.toString()));
        } else {
            setValue('amount', 0);
        }
    }
  }, [selectedInvoiceId, invoices, setValue, payment]);


  const onSubmit = async (values: PaymentFormValues) => {
    if (payment) {
      // Update existing payment
      const result = await updatePayment(payment.id, {
        ...values,
        notes: values.notes === undefined ? null : values.notes,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Payment updated successfully.`);
        onClose();
      }
    } else {
      // Create new payment
      const result = await createPayment({
        ...values,
        notes: values.notes === undefined ? null : values.notes,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Payment recorded successfully.`);
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border shadow-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold text-gray-900 tracking-tight">
            {payment ? "Edit Payment (limited)" : "Record New Payment"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="invoice_id" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Invoice <span className="text-red-500">*</span>
              </label>
              <select
                {...register("invoice_id")}
                className="w-full h-10 px-3 border border-gray-200 bg-gray-50/50 rounded-lg focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 transition-all duration-200"
              >
                <option value="">Select an invoice</option>
                {invoices.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_number} - {inv.client.name} (Amount: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(inv.total_amount)})
                  </option>
                ))}
              </select>
              {errors.invoice_id && (
                <p className="text-red-500 text-xs mt-1.5">{errors.invoice_id.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="bank_account_id" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Bank Account <span className="text-red-500">*</span>
              </label>
              <select
                {...register("bank_account_id")}
                className="w-full h-10 px-3 border border-gray-200 bg-gray-50/50 rounded-lg focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 transition-all duration-200"
              >
                <option value="">Select a bank account</option>
                {bankAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.bank_name})</option>)}
              </select>
              {errors.bank_account_id && (
                <p className="text-red-500 text-xs mt-1.5">{errors.bank_account_id.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="amount" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Payment Amount (Rp) <span className="text-red-500">*</span>
              </label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <Input
                    id="amount"
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
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1.5">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="method" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                {...register("method")}
                className="w-full h-10 px-3 border border-gray-200 bg-gray-50/50 rounded-lg focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 transition-all duration-200"
              >
                <option value="MANUAL">Manual</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
              {errors.method && (
                <p className="text-red-500 text-xs mt-1.5">{errors.method.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Notes (Optional)
              </label>
              <Input
                id="notes"
                {...register("notes")}
                className="h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 transition-all duration-200"
                placeholder="Additional notes about this payment"
              />
              {errors.notes && (
                <p className="text-red-500 text-xs mt-1.5">{errors.notes.message}</p>
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
              {isSubmitting ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
