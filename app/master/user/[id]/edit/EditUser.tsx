"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { User } from "@/types";
import { updateUser } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, User as UserIcon, Save } from "lucide-react";

const editUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
    password: z.string().min(6, "Password must be at least 6 characters.").optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
    role: z.enum(["ADMIN", "USER", "KEUANGAN", "KASIR"]),
    is_active: z.boolean(),
}).refine((data) => {
    if (data.password && data.password !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserProps {
    user: User;
}

export default function EditUser({ user }: EditUserProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<EditUserFormValues>({
        resolver: zodResolver(editUserSchema),
        defaultValues: {
            name: user.name,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
        },
    });

    const onSubmit = async (values: EditUserFormValues) => {
        setIsLoading(true);
        const result = await updateUser(user.id, values);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("User updated successfully.");
            router.push(`/master/user/${user.id}`);
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
                        onClick={() => router.push("/master/user")}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Users
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
                            <p className="text-sm text-gray-600">Update user information and permissions</p>
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
                                    placeholder="Enter user full name"
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
                                    placeholder="user@example.com"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1.5 block">
                                    New Password
                                </label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register("password")}
                                    className="h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 transition-all duration-200"
                                    placeholder="Leave empty to keep current password"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-1.5 block">
                                    Confirm Password
                                </label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    {...register("confirmPassword")}
                                    className="h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 transition-all duration-200"
                                    placeholder="Confirm new password"
                                />
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="role" className="text-sm font-medium text-gray-700 mb-1.5 block">
                                    User Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register("role")}
                                    className="w-full h-10 px-3 border border-gray-200 bg-gray-50/50 rounded-lg focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 transition-all duration-200"
                                >
                                    <option value="USER">User</option>
                                    <option value="KASIR">Kasir</option>
                                    <option value="KEUANGAN">Keuangan</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                                {errors.role && (
                                    <p className="text-red-500 text-xs mt-1.5">{errors.role.message}</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    {...register("is_active")}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
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
                                onClick={() => router.push(`/master/user/${user.id}`)}
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
                                {isSubmitting || isLoading ? "Updating..." : "Update User"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
