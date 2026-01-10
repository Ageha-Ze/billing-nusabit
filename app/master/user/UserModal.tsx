"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { createUser, updateUser } from "@/lib/actions/users";
import { User } from "@/types";
import { toast } from "sonner";
import { useEffect } from "react";
import { userSchema, UserFormValues } from "@/lib/validations/user";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
}

export default function UserModal({ isOpen, onClose, user }: UserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    if (user) {
        reset({
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } else {
        reset({ name: '', email: '', password: '', role: 'KASIR' });
    }
  }, [user, reset]);

  const onSubmit = async (values: UserFormValues) => {
    let result;

    if (user) {
      const updateData: Partial<Omit<User, 'id' | 'created_at'>> = {
        name: values.name,
        email: values.email,
        role: values.role,
      };
      result = await updateUser(user.id, updateData);
    } else {
      if (!values.password) {
        toast.error("Password is required for new users");
        return;
      }
      const createData = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      };
      result = await createUser(createData);
    }

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`User ${user ? "updated" : "created"} successfully.`);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border shadow-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold text-gray-900 tracking-tight">
            {user ? "Edit User" : "Add New User"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                {...register("name")}
                className="h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 transition-all duration-200"
                placeholder="Enter user name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>
              )}
            </div>

            <div>
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

            {!user && (
              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Password <span className="text-red-500">*</span>
                </label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="h-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 transition-all duration-200"
                  placeholder="Minimum 6 characters"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>
                )}
              </div>
            )}

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
              {isSubmitting ? "Saving..." : "Save User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
