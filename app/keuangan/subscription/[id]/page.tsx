import { supabaseAdmin } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, User, Package, Calendar, CheckCircle, XCircle, CreditCard } from "lucide-react";

async function getSubscription(id: string) {
    const { data: subscription, error } = await supabaseAdmin
        .from('subscriptions')
        .select(`
            *,
            client:clients(id, name, email),
            product:products(id, name)
        `)
        .eq('id', id)
        .single();

    if (error || !subscription) {
        notFound();
    }

    return subscription;
}

export default async function SubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const subscription = await getSubscription(id);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-700';
            case 'EXPIRED':
                return 'bg-red-100 text-red-700';
            case 'CANCELLED':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <CheckCircle className="w-6 h-6 text-green-600" />;
            case 'EXPIRED':
                return <XCircle className="w-6 h-6 text-red-600" />;
            default:
                return <CreditCard className="w-6 h-6 text-gray-600" />;
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Back Button */}
            <Link
                href="/keuangan/subscription"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Subscriptions
            </Link>

            {/* Header Card */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-sm p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{subscription.client.name}'s Subscription</h1>
                            <p className="text-purple-100 mt-1">Subscription Details & Billing Information</p>
                        </div>
                    </div>
                    <Link href={`/keuangan/subscription/${subscription.id}/edit`}>
                        <Button className="bg-white text-purple-600 hover:bg-purple-50 font-medium">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Subscription
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-500">Client</p>
                            <p className="text-base font-semibold text-gray-900 mt-1">{subscription.client.name}</p>
                            <p className="text-sm text-gray-600 mt-1">{subscription.client.email}</p>
                        </div>
                    </div>
                </div>

                {/* Product Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-500">Product</p>
                            <p className="text-base font-semibold text-gray-900 mt-1">{subscription.product.name}</p>
                        </div>
                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                            {getStatusIcon(subscription.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(subscription.status)}`}>
                                {subscription.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Dates Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-500">Subscription Period</p>
                            <p className="text-sm text-gray-900 mt-1">
                                <span className="font-medium">Start:</span> {new Date(subscription.start_date).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                            </p>
                            <p className="text-sm text-gray-900 mt-1">
                                <span className="font-medium">Expiry:</span> {new Date(subscription.expiry_date).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    Subscription Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Subscription ID</p>
                        <p className="text-sm font-mono text-gray-900 mt-1">{subscription.id}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Created At</p>
                        <p className="text-sm text-gray-900 mt-1">
                            {new Date(subscription.created_at).toLocaleString('id-ID', {
                                dateStyle: 'long',
                                timeStyle: 'short'
                            })}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Last Updated</p>
                        <p className="text-sm text-gray-900 mt-1">
                            {subscription.updated_at ? new Date(subscription.updated_at).toLocaleString('id-ID', {
                                dateStyle: 'long',
                                timeStyle: 'short'
                            }) : 'Never'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
