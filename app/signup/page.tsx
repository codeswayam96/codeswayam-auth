"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Zap, Eye, EyeOff, AlertCircle } from "lucide-react";
import { checkUserAuth } from "@/lib/auth-redirect";

function SignupForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const searchParams = useSearchParams();
    const defaultRedirect =
        process.env.NEXT_PUBLIC_DEFAULT_REDIRECT ||
        (process.env.NODE_ENV === "production"
            ? "https://www.codeswayam.com/dashboard"
            : "http://localhost:3004/dashboard");
    const redirectUrl = searchParams.get("redirect") || defaultRedirect;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            setLoading(true);
            setError("");
            const res = await fetch(`${apiUrl}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credentialResponse.credential }),
                credentials: "include",
            });

            if (res.ok) {
                window.location.href = redirectUrl;
            } else {
                throw new Error("Google signup failed");
            }
        } catch {
            setError("Google signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${apiUrl}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
                credentials: "include",
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Failed to create account. Email may already be in use.");
            }

            window.location.href = redirectUrl;
        } catch (err: any) {
            setError(err.message || "An error occurred during signup.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                        <AlertCircle size={16} className="shrink-0" />
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? "Creating account..." : "Create Account"}
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
                </div>
            </div>

            <div className="flex justify-center">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google signup failed.")}
                    theme="outline"
                    shape="pill"
                    width="100%"
                />
            </div>
        </div>
    );
}

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            const isAuthenticated = await checkUserAuth(apiUrl);
            if (isAuthenticated) {
                router.push("/account");
            }
            setIsLoading(false);
        };

        checkAuth();
    }, [router]);

    // Show nothing while checking authentication
    if (isLoading) {
        return null;
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <Link href="/" className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity">
                        <Zap size={24} />
                    </Link>
                    <CardTitle className="text-2xl">Join CodeSwayam</CardTitle>
                    <CardDescription>One account to unlock the entire SaaS ecosystem</CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div className="text-center text-sm text-muted-foreground py-4">Loading...</div>}>
                        <SignupForm />
                    </Suspense>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
