import { supabaseAdmin } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Mail, Phone, MapPin, CreditCard, Calendar } from "lucide-react";

async function getClient(id: string) {
    const { data: client, error } = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error || !client) {
        notFound();
    }

    return client;
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const client = await getClient(id);

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Back Button */}
            <Link 
                href="/master/client"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Clients
            </Link>

            {/* Header Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-sm p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{client.name}</h1>
                        <p className="text-blue-100 mt-1">Client Details & Information</p>
                    </div>
                    <Link href={`/master/client/${client.id}/edit`}>
                        <Button className="bg-white text-blue-600 hover:bg-blue-50 font-medium">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Client
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Mail className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-500">Email Address</p>
                            <p className="text-base font-semibold text-gray-900 mt-1 break-all">{client.email}</p>
                        </div>
                    </div>
                </div>

                {/* Phone Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Phone className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-500">Phone (WhatsApp)</p>
                            <p className="text-base font-semibold text-gray-900 mt-1">
                                {client.phone_wa || <span className="text-gray-400">Not provided</span>}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Address Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-500">Address</p>
                            <p className="text-base font-semibold text-gray-900 mt-1">
                                {client.address || <span className="text-gray-400">Not provided</span>}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Identity Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-500">Identity No (KTP)</p>
                            <p className="text-base font-semibold text-gray-900 mt-1">
                                {client.identity_no || <span className="text-gray-400">Not provided</span>}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    Account Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Client ID</p>
                        <p className="text-sm font-mono text-gray-900 mt-1">{client.id}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Created At</p>
                        <p className="text-sm text-gray-900 mt-1">
                            {new Date(client.created_at).toLocaleString('id-ID', {
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