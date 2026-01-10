"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bankAccountSchema, BankAccountFormValues } from "@/lib/validations/kas";
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
import { createBankAccount, updateBankAccount } from "@/lib/actions/kas";
import { BankAccount } from "@/types";
import { toast } from "sonner";
import { useEffect } from "react";

interface KasModalProps {
  isOpen: boolean;
  onClose: () => void;
  account?: BankAccount | null;
}

export default function KasModal({ isOpen, onClose, account }: KasModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema),
  });

  useEffect(() => {
    if (account) {
        reset(account);
    } else {
        reset({ name: '', bank_name: '', account_number: '', balance: 0, is_active: true });
    }
  }, [account, reset]);

  const onSubmit = async (values: BankAccountFormValues) => {
    const result = account
      ? await updateBankAccount(account.id, values)
      : await createBankAccount(values);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Bank Account ${account ? "updated" : "created"} successfully.`);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border shadow-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold text-gray-900 tracking-tight">
            {account ? "Edit Bank Account" : "Add New Bank Account"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Account Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                {...register("name")}
                className="h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-teal-500/20 focus:ring-offset-0 transition-all duration-200"
                placeholder="Enter account name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="bank_name" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="bank_name"
                {...register("bank_name")}
                className="h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-teal-500/20 focus:ring-offset-0 transition-all duration-200"
                placeholder="e.g., Bank Central Asia"
              />
              {errors.bank_name && (
                <p className="text-red-500 text-xs mt-1.5">{errors.bank_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="account_number" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Account Number <span className="text-red-500">*</span>
              </label>
              <Input
                id="account_number"
                {...register("account_number")}
                className="h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-teal-500/20 focus:ring-offset-0 transition-all duration-200"
                placeholder="Enter account number"
              />
              {errors.account_number && (
                <p className="text-red-500 text-xs mt-1.5">{errors.account_number.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="balance" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Initial Balance (Rp) <span className="text-red-500">*</span>
              </label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                {...register("balance", { valueAsNumber: true })}
                className="h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-teal-500/20 focus:ring-offset-0 transition-all duration-200"
                placeholder="0.00"
              />
              {errors.balance && (
                <p className="text-red-500 text-xs mt-1.5">{errors.balance.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_active"
                {...register("is_active")}
                className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                Account is active
              </label>
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
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isSubmitting ? "Saving..." : "Save Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
