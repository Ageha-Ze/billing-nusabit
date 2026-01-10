"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bankAccountSchema, BankAccountFormValues } from "@/lib/validations/kas";
import { updateBankAccount } from "@/lib/actions/kas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BankAccount } from "@/types";
import { toast } from "sonner";
import { ArrowLeft, Building2, Save } from "lucide-react";

interface EditKasProps {
    account: BankAccount;
}

export default function EditKas({ account }: EditKasProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<BankAccountFormValues>({
        resolver: zodResolver(bankAccountSchema),
        defaultValues: {
            name: account.name,
            bank_name: account.bank_name,
            account_number: account.account_number,
            balance: account.balance,
            is_active: account.is_active,
        },
    });

    const onSubmit = async (values: BankAccountFormValues) => {
        setIsLoading(true);
        const result = await updateBankAccount(account.id, values);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Bank account updated successfully.");
            router.push(`/master/kas/${account.id}`);
        }
        setIsLoading(false);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/master/kas")}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Bank Accounts
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Bank Account</h1>
                            <p className="text-sm text-gray-600">Update bank account information</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <div className="max-w-2xl">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
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

                            <div className="md:col-span-2">
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
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.push(`/master/kas/${account.id}`)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || isLoading}
                                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {isSubmitting || isLoading ? "Updating..." : "Update Account"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
