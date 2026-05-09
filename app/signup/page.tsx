"use client";

import { useState, Suspense, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { Loader2, Zap, Eye, EyeOff, AlertCircle, MailCheck } from "lucide-react";
import { checkUserAuth, isAllowedRedirect } from "@/lib/auth-redirect";
import { resolveSignupSource } from "@/lib/signup-source";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ─────────────────────────────────────────────────────────────────────────────
// Email verification pending state (shown after signup in "both" mode)
// ─────────────────────────────────────────────────────────────────────────────

function EmailVerificationPending({
    email,
    onReset,
    redirectUrl,
}: {
    email: string;
    onReset: () => void;
    redirectUrl: string;
}) {
    const [otp, setOtp] = useState("");
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [verifyError, setVerifyError] = useState("");

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
                credentials: "include", // For cookies
            });
            const data = await res.json().catch(() => ({}));
            
            if (!res.ok) throw new Error(data.message || "Invalid verification code.");
            
            // Successfully verified & logged in -> redirect to target
            window.location.href = redirectUrl;
        } catch (err: any) {
            setVerifyError(err.message || "Failed to verify. Please check the code and try again.");
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
            if (!res.ok) throw new Error(data.message || "Failed to resend email");
            setResendMsg("A new verification code has been sent!");
        } catch (err: any) {
            setResendError(err.message || "Failed to resend. Please try again.");
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-blue-100">
                        <MailCheck size={24} className="text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-blue-900">Verify your email</h3>
                        <p className="text-sm text-blue-700 mt-0.5">
                            We sent a 6-digit code to <strong>{email}</strong>
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                        id="otp"
                        type="text"
                        required
                        maxLength={6}
                        placeholder="123456"
                        className="text-center tracking-widest text-xl font-mono"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only allow numbers
                    />
                </div>

                {verifyError && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                        <AlertCircle size={16} className="shrink-0" />
                        {verifyError}
                    </div>
                )}
                
                {resendError && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                        <AlertCircle size={16} className="shrink-0" />
                        {resendError}
                    </div>
                )}
                
                {resendMsg && (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
                        <MailCheck size={16} className="shrink-0" />
                        {resendMsg}
                    </div>
                )}

                <Button type="submit" className="w-full" disabled={verifyLoading || otp.length !== 6}>
                    {verifyLoading && <Loader2 size={16} className="animate-spin mr-2" />}
                    {verifyLoading ? "Verifying…" : "Submit Verification Code"}
                </Button>
            </form>

            <div className="space-y-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleResend}
                    disabled={resendLoading}
                >
                    {resendLoading && <Loader2 size={16} className="animate-spin mr-2" />}
                    {resendLoading ? "Sending…" : "Resend Verification Code"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                    Used the wrong email?{" "}
                    <button
                        type="button"
                        onClick={onReset}
                        className="text-primary hover:underline font-semibold"
                    >
                        Start over
                    </button>
                </p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Unified Signup Form
// ─────────────────────────────────────────────────────────────────────────────

function SignupForm({
    redirectUrl,
    signupSource,
}: {
    redirectUrl: string;
    signupSource?: string;
}) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [referralCode, setReferralCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailVerificationPending, setEmailVerificationPending] = useState(false);

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            setLoading(true);
            setError("");
            const res = await fetch(`${API_URL}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credentialResponse.credential, signupSource }),
                credentials: "include",
            });

            if (res.ok) {
                window.location.href = redirectUrl;
            } else {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Google signup failed");
            }
        } catch (err: any) {
            setError(err.message || "Google sign-up failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, referralCode: referralCode || undefined, signupSource }),
                credentials: "include",
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.message || "Failed to create account. Email may already be in use.");
            }

            if (data.emailVerificationPending) {
                setEmailVerificationPending(true);
            } else {
                // "custom" mode: logged in immediately
                window.location.href = redirectUrl;
            }
        } catch (err: any) {
            setError(err.message || "An error occurred during signup.");
        } finally {
            setLoading(false);
        }
    };

    if (emailVerificationPending) {
        return (
            <EmailVerificationPending
                email={email}
                redirectUrl={redirectUrl}
                onReset={() => {
                    setEmailVerificationPending(false);
                    setEmail("");
                    setError("");
                }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                        id="name"
                        type="text"
                        required
                        autoComplete="name"
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
                        autoComplete="email"
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
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                        />
                        <button
                            type="button"
                            tabIndex={-1}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                    <Input
                        id="referralCode"
                        type="text"
                        autoComplete="off"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        placeholder="Got a referral code?"
                    />
                </div>



                {error && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                        <AlertCircle size={16} className="shrink-0" />
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 size={16} className="animate-spin mr-2" />}
                    {loading ? "Creating account…" : "Create Account"}
                </Button>
            </form>

            {/* Google sign-up */}
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
                    onError={() => setError("Google sign-up failed. Please try again.")}
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

function SignupPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const getRedirectUrl = useCallback(() => {
        const defaultRedirect =
            process.env.NEXT_PUBLIC_DEFAULT_REDIRECT ||
            (process.env.NODE_ENV === "production"
                ? "https://www.codeswayam.com/dashboard"
                : "http://localhost:3003/dashboard");
        const raw = searchParams.get("redirect") || searchParams.get("redirect_url") || defaultRedirect;
        return isAllowedRedirect(raw) ? raw : "/dashboard";
    }, [searchParams]);

    useEffect(() => {

        const checkAuth = async () => {
            const timeoutPromise = new Promise<boolean>((resolve) =>
                setTimeout(() => resolve(false), 4000)
            );
            const isAuthenticated = await Promise.race([checkUserAuth(API_URL), timeoutPromise]);
            if (isAuthenticated) {
                window.location.href = getRedirectUrl();
                return;
            }
            setIsCheckingAuth(false);
        };

        checkAuth();
    }, [getRedirectUrl, router]);

    if (isCheckingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const redirectUrl = getRedirectUrl();
    const signupSource = resolveSignupSource(searchParams);

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
                    <CardTitle className="text-2xl">Join CodeSwayam</CardTitle>
                    <CardDescription>
                        One account to unlock the entire SaaS ecosystem
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SignupForm redirectUrl={redirectUrl} signupSource={signupSource} />
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href={`/login${searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect")!)}` : ""}`}
                            className="font-semibold text-primary hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <SignupPageInner />
        </Suspense>
    );
}
