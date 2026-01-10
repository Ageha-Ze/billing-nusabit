"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cashFlowSchema, CashFlowFormValues } from "@/lib/validations/cashflow";
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
import { createCashFlowEntry, updateCashFlowEntry } from "@/lib/actions/cashflow";
import { CashFlow, BankAccount } from "@/types";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface CashFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashFlowEntry?: CashFlow | null;
}

export default function CashFlowModal({ isOpen, onClose, cashFlowEntry }: CashFlowModalProps) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CashFlowFormValues>({
    resolver: zodResolver(cashFlowSchema),
    defaultValues: {
      jenis: 'masuk',
      kategori: '',
      jumlah: 0,
      keterangan: '',
      tanggal: new Date().toISOString().split('T')[0],
      kas_id: null,
    },
  });

  // Fetch bank accounts
  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const response = await fetch('/api/master/kas?limit=1000'); // Fetch all bank accounts
        if (response.ok) {
          const result = await response.json();
          setBankAccounts(result.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch bank accounts', error);
      }
    };

    if (isOpen) {
      fetchBankAccounts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (cashFlowEntry) {
        reset({
            jenis: cashFlowEntry.jenis,
            kategori: cashFlowEntry.kategori,
            jumlah: cashFlowEntry.jumlah,
            keterangan: cashFlowEntry.keterangan || '',
            tanggal: new Date(cashFlowEntry.tanggal).toISOString().split('T')[0],
            kas_id: cashFlowEntry.kas_id ? cashFlowEntry.kas_id.toString() : '',
        });
    } else {
        reset({
            jenis: 'masuk',
            kategori: '',
            jumlah: 0,
            keterangan: '',
            tanggal: new Date().toISOString().split('T')[0],
            kas_id: '',
        });
    }
  }, [cashFlowEntry, reset]);

  const onSubmit = async (values: CashFlowFormValues) => {
    const entryData = {
      jenis: values.jenis,
      kategori: values.kategori,
      jumlah: values.jumlah,
      keterangan: values.keterangan || null,
      tanggal: values.tanggal,
      kas_id: values.kas_id || null,
    };

    const result = cashFlowEntry
      ? await updateCashFlowEntry(cashFlowEntry.id, entryData)
      : await createCashFlowEntry(entryData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Cash Flow entry ${cashFlowEntry ? "updated" : "created"} successfully.`);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{cashFlowEntry ? "Edit Cash Flow Entry" : "Add New Cash Flow Entry"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label>Type</label>
            <select {...register("jenis")} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value="masuk">Income</option>
                <option value="keluar">Expense</option>
            </select>
            {errors.jenis && <p className="text-red-500 text-sm">{errors.jenis.message}</p>}
          </div>

          <div>
            <label htmlFor="kategori">Category</label>
            <Input id="kategori" {...register("kategori")} />
            {errors.kategori && <p className="text-red-500 text-sm">{errors.kategori.message}</p>}
          </div>

          <div>
            <label htmlFor="jumlah">Amount</label>
            <Input id="jumlah" type="number" step="0.01" {...register("jumlah", { valueAsNumber: true })} />
            {errors.jumlah && <p className="text-red-500 text-sm">{errors.jumlah.message}</p>}
          </div>

          <div>
            <label htmlFor="keterangan">Description (Optional)</label>
            <Input id="keterangan" {...register("keterangan")} />
            {errors.keterangan && <p className="text-red-500 text-sm">{errors.keterangan.message}</p>}
          </div>

          <div>
            <label htmlFor="tanggal">Date</label>
            <Input id="tanggal" type="date" {...register("tanggal")} />
            {errors.tanggal && <p className="text-red-500 text-sm">{errors.tanggal.message}</p>}
          </div>

          <div>
            <label htmlFor="kas_id">Bank Account (Optional)</label>
            <select {...register("kas_id")} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              <option value="">Select Bank Account (Optional)</option>
              {bankAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} - {account.account_number} ({account.bank_name})
                </option>
              ))}
            </select>
            {errors.kas_id && <p className="text-red-500 text-sm">{errors.kas_id.message}</p>}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
