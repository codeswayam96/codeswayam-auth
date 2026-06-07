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
import { Loader2, Zap, Eye, EyeOff, AlertCircle, MailCheck, CheckCircle, Smartphone } from "lucide-react";
import { checkUserAuth, isAllowedRedirect } from "@/lib/auth-redirect";
import { BrandLoader } from "@/components/brand-loader";

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

function VerificationNeededBanner({ email, onBack, redirectUrl }: { email: string; onBack: () => void; redirectUrl: string }) {
    const [otp, setOtp] = useState("");
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [verifyError, setVerifyError] = useState("");
    const [verifySuccess, setVerifySuccess] = useState(false);

    const [resendLoading, setResendLoading] = useState(false);
    const [resendMsg, setResendMsg] = useState("");
    const [resendError, setResendError] = useState("");

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifyLoading(true);
        setVerifyError("");
        setResendMsg("");

        if (otp.length !== 6) {
            setVerifyError("Please enter a valid 6-digit code.");
            setVerifyLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/auth/verify-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
                credentials: "include",
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Invalid verification code.");
            setVerifySuccess(true);
            // Cookie is set by backend — redirect to destination after brief success message
            setTimeout(() => { window.location.href = redirectUrl; }, 800);
        } catch (err: any) {
            setVerifyError(err.message || "Failed to verify. Please check the code and try again.");
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        setResendMsg("");
        setResendError("");
        setVerifyError("");
        try {
            const res = await fetch(`${API_URL}/auth/resend-verification`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
                credentials: "include",
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Failed to resend.");
            setResendMsg("A new 6-digit code has been sent to your inbox.");
            setOtp("");
        } catch (err: any) {
            setResendError(err.message || "Failed to resend. Try again.");
        } finally {
            setResendLoading(false);
        }
    };

    if (verifySuccess) {
        return (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
                <CheckCircle size={16} /> Email verified! Signing you in…
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
                <MailCheck size={20} className="shrink-0 text-amber-600 mt-0.5" />
                <div>
                    <p className="font-semibold text-amber-900 text-sm">Email verification required</p>
                    <p className="text-amber-700 text-sm mt-1">
                        We sent a <strong>6-digit code</strong> to <strong>{email}</strong>. Enter it below to verify your account.
                    </p>
                </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-3">
                <div className="space-y-1">
                    <Label htmlFor="login-otp">Verification Code</Label>
                    <Input
                        id="login-otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="123456"
                        className="text-center tracking-widest text-xl font-mono"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        autoFocus
                    />
                </div>

                {verifyError && <ErrorAlert message={verifyError} />}

                {resendMsg && (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
                        <CheckCircle size={16} />{resendMsg}
                    </div>
                )}
                {resendError && <ErrorAlert message={resendError} />}

                <Button type="submit" className="w-full" disabled={verifyLoading || otp.length !== 6}>
                    {verifyLoading && <Loader2 size={16} className="animate-spin mr-2" />}
                    {verifyLoading ? "Verifying…" : "Verify & Sign In"}
                </Button>
            </form>

            <div className="flex flex-col gap-2 border-t pt-3">
                <Button variant="outline" className="w-full" onClick={handleResend} disabled={resendLoading}>
                    {resendLoading && <Loader2 size={16} className="animate-spin mr-2" />}
                    {resendLoading ? "Sending…" : "Resend Code"}
                </Button>
                <button
                    className="text-sm text-primary hover:underline w-full text-center"
                    onClick={onBack}
                >
                    ← Back to login
                </button>
            </div>
        </div>
    );
}

function TwoFactorChallenge({ email, onBack, redirectUrl }: { email: string; onBack: () => void; redirectUrl: string }) {
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/auth/verify-2fa`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, token }),
                credentials: "include",
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Invalid 2FA code.");
            
            window.location.href = redirectUrl;
        } catch (err: any) {
            setError(err.message || "Failed to verify 2FA code.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-200 p-4">
                <Smartphone size={20} className="shrink-0 text-blue-600 mt-0.5" />
                <div>
                    <p className="font-semibold text-blue-900 text-sm">Two-factor authentication</p>
                    <p className="text-blue-700 text-sm mt-1">
                        Enter the 6-digit code from your authenticator app to sign in.
                    </p>
                </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-3">
                <div className="space-y-1">
                    <Label htmlFor="2fa-token">Authentication Code</Label>
                    <Input
                        id="2fa-token"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        className="text-center tracking-widest text-xl font-mono"
                        value={token}
                        onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                        autoFocus
                    />
                </div>

                {error && <ErrorAlert message={error} />}

                <Button type="submit" className="w-full" disabled={loading || token.length !== 6}>
                    {loading && <Loader2 size={16} className="animate-spin mr-2" />}
                    {loading ? "Verifying…" : "Verify & Sign In"}
                </Button>
            </form>

            <button
                className="text-sm text-primary hover:underline w-full text-center"
                onClick={onBack}
            >
                ← Back to login
            </button>
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
    const [requires2FA, setRequires2FA] = useState(false);

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
                const data = await res.json().catch(() => ({}));
                if (data.requires2FA) {
                    if (data.user?.email) setEmail(data.user.email);
                    setRequires2FA(true);
                    return;
                }
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

            // Email not yet verified — trigger a fresh OTP and show verification form
            if (data.requiresVerification || data.emailVerificationPending) {
                // Silently send a fresh OTP so user doesn't have to hit "Resend"
                fetch(`${API_URL}/auth/resend-verification`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                    credentials: "include",
                }).catch(() => {}); // fire-and-forget
                setVerificationNeeded(true);
                return;
            }

            if (data.requires2FA) {
                setRequires2FA(true);
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

    // When account needs verification, also trigger a resend so the code is fresh
    if (verificationNeeded) {
        return (
            <VerificationNeededBanner
                email={email}
                onBack={() => setVerificationNeeded(false)}
                redirectUrl={redirectUrl}
            />
        );
    }

    if (requires2FA) {
        return (
            <TwoFactorChallenge
                email={email}
                onBack={() => setRequires2FA(false)}
                redirectUrl={redirectUrl}
            />
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
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const getRedirectUrl = useCallback(() => {
        // Support both `redirect` and `redirect_url` params
        const raw = searchParams.get("redirect") || searchParams.get("redirect_url") || "/dashboard";
        return isAllowedRedirect(raw) ? raw : "/dashboard";
    }, [searchParams]);

    useEffect(() => {

        const checkAuth = async () => {
            // Timeout after 4 seconds — don't block login page on slow/broken backend
            const timeoutPromise = new Promise<boolean>((resolve) =>
                setTimeout(() => resolve(false), 4000)
            );
            const authCheck = checkUserAuth(API_URL);
            const isAuthenticated = await Promise.race([authCheck, timeoutPromise]);

            if (isAuthenticated) {
                window.location.href = getRedirectUrl();
                return;
            }
            setIsCheckingAuth(false);
        };

        checkAuth();
    }, [getRedirectUrl]);

    if (isCheckingAuth) {
        return <BrandLoader fullScreen size="lg" text="Verifying your credentials..." />;
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
                        Use your account to access all tools
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
                <BrandLoader fullScreen size="lg" text="Starting secure sign-in..." />
            }
        >
            <LoginPageInner />
        </Suspense>
    );
}
