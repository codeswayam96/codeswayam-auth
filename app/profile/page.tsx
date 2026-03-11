"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${apiUrl}/users/profile`, { withCredentials: true });
                setUser(res.data);
            } catch (err) {
                console.error("Failed to fetch profile", err);
                setError("Failed to load profile. Please sign in again.");
                // router.push("/login");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [apiUrl, router]);

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading profile...</div>;

    if (error) return (
        <div className="flex flex-col justify-center items-center min-h-screen space-y-4">
            <p className="text-red-500 font-medium">{error}</p>
            <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 bg-[#00ADB5] text-white rounded-md shadow-sm"
            >
                Go to Login
            </button>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">User Profile</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Centralized account details for Code Swayam.</p>
                    </div>
                    <span className="h-12 w-12 rounded-full bg-[#00ADB5] text-white flex items-center justify-center font-bold text-xl uppercase">
                        {user.name?.[0] || user.email[0]}
                    </span>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Full name</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.name || "N/A"}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Email address</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Role</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize font-semibold text-[#00ADB5]">{user.role}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">
                                {user.clerkId ? "Clerk" : user.googleId ? "Google" : "Custom Login"}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={() => {
                        // Logout logic - clear cookie and redirect
                        document.cookie = "Authentication=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                        router.push("/login");
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Sign out
                </button>
            </div>
        </div>
    );
}
