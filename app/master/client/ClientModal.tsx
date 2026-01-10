"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, ClientFormValues } from "@/lib/validations/client";
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
import { createClient, updateClient } from "@/lib/actions/clients";
import { Client } from "@/types";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import FileUpload from "@/components/FileUpload";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
}

export default function ClientModal({ isOpen, onClose, client }: ClientModalProps) {
  const [ktpFile, setKtpFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: client || {},
  });

  useEffect(() => {
    if (client) {
        reset(client);
    } else {
        reset({ name: '', email: '', phone_wa: '', address: '', identity_no: '', ktp_file_url: null });
    }
    setKtpFile(null);
  }, [client, reset]);

  const onSubmit = async (values: ClientFormValues) => {
    const clientData = {
      name: values.name,
      email: values.email,
      phone_wa: values.phone_wa || null,
      address: values.address || null,
      identity_no: values.identity_no || null,
    };

    const result = client
      ? await updateClient(client.id, clientData, ktpFile)
      : await createClient(clientData, ktpFile);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Client ${client ? "updated" : "created"} successfully.`);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border shadow-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold text-gray-900 tracking-tight">
            {client ? "Edit Client" : "Add New Client"}
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
                placeholder="Enter client name"
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

            <FileUpload
                label="Upload KTP File (PDF or Image)"
                onFileChange={setKtpFile}
                currentFileUrl={client?.ktp_file_url}
                acceptedFileTypes="image/*,application/pdf"
            />

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
              {isSubmitting ? "Saving..." : "Save Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}