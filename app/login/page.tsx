"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get("redirect") || "https://app.codeswayam.com/dashboard";

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

            const res = await fetch(`${apiUrl}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
                credentials: "include", // This is CRITICAL for receiving the root domain cookie
            });

            if (!res.ok) {
                throw new Error("Invalid credentials");
            }

            // Redirect back to the requested subdomain or default
            window.location.href = redirectUrl;
        } catch (err: any) {
            setError(err.message || "An error occurred during login.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="mt-2">
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#00ADB5] sm:text-sm sm:leading-6 outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-2">
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#00ADB5] sm:text-sm sm:leading-6 outline-none"
                    />
                </div>
            </div>

            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-md bg-[#222831] px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-[#393E46] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00ADB5] transition-colors disabled:opacity-50"
                >
                    {loading ? "Signing in..." : "Sign in to your account"}
                </button>
            </div>
        </form>
    );
}

export default function LoginPage() {
    return (
        <div className="flex min-h-[80vh] flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center flex-col items-center">
                    <span className="flex h-10 w-10 rounded-xl bg-[#00ADB5] text-white font-bold items-center justify-center text-xl shadow-lg mb-4">CS</span>
                    <h2 className="mt-2 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                        Sign in to Code Swayam
                    </h2>
                </div>
                <p className="mt-2 text-center text-sm text-gray-500">
                    Use your central account to access all SaaS tools
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
                <div className="bg-white px-6 py-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-2xl sm:px-12 border border-gray-100">
                    <Suspense fallback={<div>Loading form...</div>}>
                        <LoginForm />
                    </Suspense>
                    <p className="mt-10 text-center text-sm text-gray-500">
                        Not a member?{' '}
                        <Link href="/signup" className="font-semibold leading-6 text-[#00ADB5] hover:text-[#008C93]">
                            Create a central account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
