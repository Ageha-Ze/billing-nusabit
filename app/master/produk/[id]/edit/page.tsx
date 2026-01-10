"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductFormValues } from "@/lib/validations/product";
import { updateProduct } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/types";
import { toast } from "sonner";
import { ArrowLeft, Package, Save } from "lucide-react";

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
    });

    useEffect(() => {
        async function fetchProduct() {
            try {
                const response = await fetch(`/api/master/produk/${params.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProduct(data);
                    reset({
                        name: data.name,
                        type: data.type,
                        price: data.price,
                    });
                } else {
                    toast.error("Product not found");
                    router.push("/master/produk");
                }
            } catch (error) {
                console.error("Failed to fetch product", error);
                toast.error("Failed to load product");
            } finally {
                setIsLoading(false);
            }
        }

        if (params.id) {
            fetchProduct();
        }
    }, [params.id, reset, router]);

    const onSubmit = async (values: ProductFormValues) => {
        const result = await updateProduct(params.id as string, values);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Product updated successfully!");
            router.push(`/master/produk/${params.id}`);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-center h-64">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500">Loading product...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="p-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Product not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/master/produk")}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Products
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                            <p className="text-sm text-gray-600">Update product information</p>
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
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="name"
                                    {...register("name")}
                                    className="border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter product name"
                                />
                                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register("type")}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                                >
                                    <option value="HOSTING">Hosting</option>
                                    <option value="DOMAIN">Domain</option>
                                    <option value="WEB">Web</option>
                                </select>
                                {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                    Price (Rp) <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    {...register("price", { valueAsNumber: true })}
                                    className="border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                    placeholder="0.00"
                                />
                                {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-green-600 hover:bg-green-700 text-white font-medium flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {isSubmitting ? "Updating..." : "Update Product"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push(`/master/produk/${params.id}`)}
                                className="border-gray-200 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
