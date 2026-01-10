"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "./actions";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Building2, Shield, Zap } from "lucide-react";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginSchema) => {
        setIsLoading(true);
        const result = await login(data);
        if (result.error) {
            toast.error(result.error);
            setIsLoading(false);
        } else {
            toast.success("Login successful!");
            router.push("/dashboard");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

                {/* Left Side - Branding */}
                <div className="hidden lg:flex flex-col justify-center space-y-8 p-8">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Nusabit Billing</h1>
                        </div>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Professional billing and invoicing system for Nusabit Web Hosting & Domain services.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Shield className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-gray-700">Secure & Encrypted</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Zap className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-gray-700">Fast & Reliable</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="text-gray-700">Enterprise Ready</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="flex justify-center">
                    <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="space-y-1 text-center pb-8">
                            <div className="flex lg:hidden justify-center mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                                    <Building2 className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
                            <CardDescription className="text-gray-600">
                                Sign in to your account to continue
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        {...register("email")}
                                        className="h-11"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600">{errors.email.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        {...register("password")}
                                        className="h-11"
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-600">{errors.password.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                            </form>

                            {/* Demo Credentials */}
                            <div className="pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500 text-center mb-2">Demo Credentials</p>
                                <div className="space-y-1 text-xs text-gray-600">
                                    <p><strong>Admin:</strong> crimsondred91@gmail.com</p>
                                    <p><strong>Finance:</strong> keuangan@nusabit.com</p>
                                    <p><strong>Cashier:</strong> kasir@nusabit.com</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
