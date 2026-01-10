// ==========================================
// FILE 5: EditClient.tsx
// Path: /master/client/[id]/edit/EditClient.tsx
// ==========================================
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, ClientFormValues } from "@/lib/validations/client";
import { updateClient } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Client } from "@/types";
import { toast } from "sonner";
import { ArrowLeft, User, Save } from "lucide-react";

interface EditClientProps {
    client: Client;
}

export default function EditClient({ client }: EditClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ClientFormValues>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            name: client.name,
            email: client.email,
            phone_wa: client.phone_wa || '',
            address: client.address || '',
            identity_no: client.identity_no || '',
        },
    });

    const onSubmit = async (values: ClientFormValues) => {
        setIsLoading(true);
        const result = await updateClient(client.id, {
            ...values,
            phone_wa: values.phone_wa === undefined ? null : values.phone_wa,
            address: values.address === undefined ? null : values.address,
            identity_no: values.identity_no === undefined ? null : values.identity_no,
        });

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Client updated successfully.");
            router.push(`/master/client/${client.id}`);
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
                        onClick={() => router.push("/master/client")}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Clients
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Client</h1>
                            <p className="text-sm text-gray-600">Update client information and details</p>
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
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="name"
                                    {...register("name")}
                                    className="h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 transition-all duration-200"
                                    placeholder="Enter client name"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1.5 block">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register("email")}
                                    className="h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 transition-all duration-200"
                                    placeholder="client@example.com"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="phone_wa" className="text-sm font-medium text-gray-700 mb-1.5 block">
                                    Phone (WhatsApp)
                                </label>
                                <Input
                                    id="phone_wa"
                                    {...register("phone_wa")}
                                    className="h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 transition-all duration-200"
                                    placeholder="+62 8xx-xxxx-xxxx"
                                />
                                {errors.phone_wa && (
                                    <p className="text-red-500 text-xs mt-1.5">{errors.phone_wa.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="identity_no" className="text-sm font-medium text-gray-700 mb-1.5 block">
                                    Identity Number (KTP)
                                </label>
                                <Input
                                    id="identity_no"
                                    {...register("identity_no")}
                                    className="h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 transition-all duration-200"
                                    placeholder="16-digit KTP number"
                                />
                                {errors.identity_no && (
                                    <p className="text-red-500 text-xs mt-1.5">{errors.identity_no.message}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="address" className="text-sm font-medium text-gray-700 mb-1.5 block">
                                    Address
                                </label>
                                <Input
                                    id="address"
                                    {...register("address")}
                                    className="h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 transition-all duration-200"
                                    placeholder="Street address, city, province"
                                />
                                {errors.address && (
                                    <p className="text-red-500 text-xs mt-1.5">{errors.address.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.push(`/master/client/${client.id}`)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || isLoading}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {isSubmitting || isLoading ? "Updating..." : "Update Client"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
