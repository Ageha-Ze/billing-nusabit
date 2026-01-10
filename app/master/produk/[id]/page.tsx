import { supabaseAdmin } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Package, Tag, DollarSign, Calendar } from "lucide-react";

async function getProduct(id: string) {
    const { data: product, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !product) {
        notFound();
    }

    return product;
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'HOSTING':
                return 'bg-blue-100 text-blue-700';
            case 'DOMAIN':
                return 'bg-green-100 text-green-700';
            case 'WEB':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Back Button */}
            <Link
                href="/master/produk"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Products
            </Link>

            {/* Header Card */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-sm p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                            <Package className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{product.name}</h1>
                            <p className="text-green-100 mt-1">Product Details & Information</p>
                        </div>
                    </div>
                    <Link href={`/master/produk/${product.id}/edit`}>
                        <Button className="bg-white text-green-600 hover:bg-green-50 font-medium">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Product
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-500">Product Name</p>
                            <p className="text-base font-semibold text-gray-900 mt-1">{product.name}</p>
                        </div>
                    </div>
                </div>

                {/* Type Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Tag className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-500">Product Type</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getTypeColor(product.type)}`}>
                                {product.type}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Price Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-500">Price</p>
                            <p className="text-xl font-bold text-green-600 mt-1">
                                Rp {new Intl.NumberFormat("id-ID").format(product.price)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    Product Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Product ID</p>
                        <p className="text-sm font-mono text-gray-900 mt-1">{product.id}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Created At</p>
                        <p className="text-sm text-gray-900 mt-1">
                            {new Date(product.created_at).toLocaleString('id-ID', {
                                dateStyle: 'long',
                                timeStyle: 'short'
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
