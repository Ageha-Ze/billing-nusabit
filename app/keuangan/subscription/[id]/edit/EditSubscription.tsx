"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubscriptionWithDetails } from "@/types";
import { updateSubscription } from "@/lib/actions/subscriptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Save } from "lucide-react";

const editSubscriptionSchema = z.object({
    status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]),
    start_date: z.string(),
    expiry_date: z.string(),
});

type EditSubscriptionFormValues = z.infer<typeof editSubscriptionSchema>;

interface EditSubscriptionProps {
    subscription: SubscriptionWithDetails;
}

export default function EditSubscription({ subscription }: EditSubscriptionProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<EditSubscriptionFormValues>({
        resolver: zodResolver(editSubscriptionSchema),
        defaultValues: {
            status: subscription.status,
            start_date: new Date(subscription.start_date).toISOString().split('T')[0],
            expiry_date: new Date(subscription.expiry_date).toISOString().split('T')[0],
        },
    });

    const onSubmit = async (values: EditSubscriptionFormValues) => {
        setIsLoading(true);
        const result = await updateSubscription(subscription.id, {
            ...values,
            start_date: values.start_date,
            expiry_date: values.expiry_date,
        });

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Subscription updated successfully.");
            router.push(`/keuangan/subscription/${subscription.id}`);
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
                        onClick={() => router.push("/keuangan/subscription")}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Subscriptions
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Subscription</h1>
                            <p className="text-sm text-gray-600">Update subscription information and status</p>
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
                        </div>

                        {/* Subscription Info Display */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <h3 className="text-sm font-medium text-gray-900">Current Subscription Details</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Client:</span>
                                    <span className="ml-2 font-medium text-gray-900">{subscription.client.name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Product:</span>
                                    <span className="ml-2 font-medium text-gray-900">{subscription.product.name}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.push(`/keuangan/subscription/${subscription.id}`)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || isLoading}
                                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {isSubmitting || isLoading ? "Updating..." : "Update Subscription"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}