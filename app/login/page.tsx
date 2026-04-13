"use client";

import { useState, Suspense, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Zap, Eye, EyeOff, AlertCircle, MailCheck, CheckCircle } from "lucide-react";
import { checkUserAuth, isAllowedRedirect } from "@/lib/auth-redirect";
import { useAuthMode } from "@/lib/auth-mode";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function ErrorAlert({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            <AlertCircle size={16} className="shrink-0" />
            {message}
        </div>
    );
}

function VerificationNeededBanner({ email }: { email: string }) {
    const [resending, setResending] = useState(false);
    const [resendMsg, setResendMsg] = useState("");
    const [resendError, setResendError] = useState("");

    const handleResend = async () => {
        setResending(true);
        setResendMsg("");
        setResendError("");
        try {
            const res = await fetch(`${API_URL}/auth/resend-verification`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
                credentials: "include",
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Failed");
            setResendMsg("Verification email sent! Check your inbox.");
        } catch (err: any) {
            setResendError(err.message || "Failed to resend. Try again.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
                <MailCheck size={20} className="shrink-0 text-amber-600 mt-0.5" />
                <div>
                    <p className="font-semibold text-amber-900 text-sm">Email verification required</p>
                    <p className="text-amber-700 text-sm mt-1">
                        Your account (<strong>{email}</strong>) needs to be verified before you can log in.
                        Check your inbox for a verification link.
                    </p>
                </div>
            </div>

            {resendMsg && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
                    <CheckCircle size={16} />{resendMsg}
                </div>
            )}
            {resendError && <ErrorAlert message={resendError} />}

            <Button variant="outline" className="w-full" onClick={handleResend} disabled={resending}>
                {resending && <Loader2 size={16} className="animate-spin mr-2" />}
                {resending ? "Sending…" : "Resend Verification Email"}
            </Button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Login Form
// ─────────────────────────────────────────────────────────────────────────────

function LoginForm({ redirectUrl }: { redirectUrl: string }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [verificationNeeded, setVerificationNeeded] = useState(false);

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            setLoading(true);
            setError("");
            const res = await fetch(`${API_URL}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credentialResponse.credential }),
                credentials: "include",
            });
            if (res.ok) {
                window.location.href = redirectUrl;
            } else {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Google login failed");
            }
        } catch (err: any) {
            setError(err.message || "Google login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setVerificationNeeded(false);

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include",
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.message || "Invalid email or password.");
            }

            // Hybrid mode: email not yet verified
            if (data.requiresVerification || data.emailVerificationPending) {
                setVerificationNeeded(true);
                return;
            }

            // Success: cookie is set, redirect
            window.location.href = redirectUrl;
        } catch (err: any) {
            setError(err.message || "An error occurred during login.");
        } finally {
            setLoading(false);
        }
    };

    if (verificationNeeded) {
        return (
            <div className="space-y-4">
                <VerificationNeededBanner email={email} />
                <button
                    className="text-sm text-primary hover:underline w-full text-center"
                    onClick={() => setVerificationNeeded(false)}
                >
                    ← Back to login
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {error && <ErrorAlert message={error} />}

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 size={16} className="animate-spin mr-2" />}
                    {loading ? "Signing in…" : "Sign in to your account"}
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center"><Separator /></div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>

            <div className="flex justify-center">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google login failed. Please try again.")}
                    useOneTap
                    theme="outline"
                    shape="pill"
                    width="100%"
                />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page wrapper
// ─────────────────────────────────────────────────────────────────────────────

function LoginPageInner() {
    const searchParams = useSearchParams();
    const { authMode } = useAuthMode();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const getRedirectUrl = useCallback(() => {
        const raw = searchParams.get("redirect") || "/account";
        return isAllowedRedirect(raw) ? raw : "/account";
    }, [searchParams]);

    useEffect(() => {
        if (authMode === null) return;

        const checkAuth = async () => {
            const isAuthenticated = await checkUserAuth(API_URL);
            if (isAuthenticated) {
                window.location.href = getRedirectUrl();
                return;
            }
            setIsCheckingAuth(false);
        };

        checkAuth();
    }, [authMode, getRedirectUrl]);

    if (authMode === null || isCheckingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const redirectUrl = getRedirectUrl();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <Link
                        href="/"
                        className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
                    >
                        <Zap size={24} />
                    </Link>
                    <CardTitle className="text-2xl">Sign in to CodeSwayam</CardTitle>
                    <CardDescription>
                        {authMode === "both"
                            ? "Use your verified email and password to sign in"
                            : "Use your account to access all tools"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm redirectUrl={redirectUrl} />
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link
                            href={`/signup${searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect")!)}` : ""}`}
                            className="font-semibold text-primary hover:underline"
                        >
                            Create one
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <LoginPageInner />
        </Suspense>
    );
}
