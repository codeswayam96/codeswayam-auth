"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get("redirect") || "http://localhost:3004/dashboard";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            setLoading(true);
            setError("");
            const res = await axios.post(`${apiUrl}/auth/google`, {
                token: credentialResponse.credential
            }, { withCredentials: true });

            if (res.status === 200 || res.status === 201) {
                window.location.href = redirectUrl;
            }
        } catch (err: any) {
            setError("Google login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include",
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Invalid credentials");
            }

            window.location.href = redirectUrl;
        } catch (err: any) {
            setError(err.message || "An error occurred during login.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="block w-full rounded-lg border border-gray-300 py-2.5 px-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent outline-none transition-shadow sm:text-sm"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <span className="text-xs text-[#00ADB5] cursor-pointer hover:underline">Forgot password?</span>
                    </div>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="block w-full rounded-lg border border-gray-300 py-2.5 px-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent outline-none transition-shadow sm:text-sm"
                    />
                </div>

                {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 font-medium">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-lg bg-[#222831] px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#393E46] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00ADB5] transition-colors disabled:opacity-50"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Signing in...
                        </span>
                    ) : "Sign in to your account"}
                </button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm font-medium leading-6">
                    <span className="bg-white px-6 text-gray-400">Or continue with</span>
                </div>
            </div>

            <div className="flex justify-center">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google login failed.")}
                    useOneTap
                    theme="outline"
                    shape="pill"
                    width="100%"
                />
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center flex-col items-center">
                    <span className="flex h-12 w-12 rounded-2xl bg-gradient-to-br from-[#00ADB5] to-[#007C83] text-white font-bold items-center justify-center text-xl shadow-lg mb-5">
                        CS
                    </span>
                    <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                        Sign in to Code Swayam
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Use your central account to access all tools
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
                <div className="bg-white px-6 py-10 shadow-sm ring-1 ring-gray-100 sm:rounded-2xl sm:px-12">
                    <Suspense fallback={<div className="text-center text-sm text-gray-500 py-4">Loading...</div>}>
                        <LoginForm />
                    </Suspense>
                    <p className="mt-8 text-center text-sm text-gray-500">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="font-semibold leading-6 text-[#00ADB5] hover:text-[#008C93]">
                            Create a central account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
