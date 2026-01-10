import { supabaseAdmin } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Mail, Shield, Calendar, CheckCircle, XCircle, Key } from "lucide-react";

async function getUser(id: string) {
    const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !user) {
        notFound();
    }

    return user;
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getUser(id);

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-red-100 text-red-700';
            case 'KEUANGAN':
                return 'bg-yellow-100 text-yellow-700';
            case 'KASIR':
                return 'bg-blue-100 text-blue-700';
            case 'USER':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Back Button */}
            <Link
                href="/master/user"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Users
            </Link>

            {/* Header Card */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-sm p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{user.name}</h1>
                            <p className="text-purple-100 mt-1">User Details & Permissions</p>
                        </div>
                    </div>
                    <Link href={`/master/user/${user.id}/edit`}>
                        <Button className="bg-white text-purple-600 hover:bg-purple-50 font-medium">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
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
                            <p className="text-base font-semibold text-gray-900 mt-1 break-all">{user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Role Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Shield className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-500">User Role</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRoleBadge(user.role)}`}>
                                {user.role}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 ${user.is_active ? 'bg-green-100' : 'bg-red-100'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            {user.is_active ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                                <XCircle className="w-6 h-6 text-red-600" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-500">Account Status</p>
                            <p className="text-base font-semibold text-gray-900 mt-1">
                                {user.is_active ? 'Active' : 'Inactive'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Password Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Key className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-500">Password</p>
                            <p className="text-base font-semibold text-gray-600 mt-1">••••••••</p>
                            <p className="text-xs text-gray-500 mt-1">(Securely hashed)</p>
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
                        <p className="text-sm font-medium text-gray-500">User ID</p>
                        <p className="text-sm font-mono text-gray-900 mt-1">{user.id}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Created At</p>
                        <p className="text-sm text-gray-900 mt-1">{new Date(user.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Last Updated</p>
                        <p className="text-sm text-gray-900 mt-1">{user.updated_at ? new Date(user.updated_at).toLocaleString() : 'Never'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
