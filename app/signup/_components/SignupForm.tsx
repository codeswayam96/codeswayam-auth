"use client";

import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { EmailVerificationPending } from "./EmailVerificationPending";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface SignupFormProps {
  redirectUrl: string;
  signupSource?: string;
}

export function SignupForm({ redirectUrl, signupSource }: SignupFormProps) {
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
        body: JSON.stringify({
          name,
          email,
          password,
          referralCode: referralCode || undefined,
          signupSource,
        }),
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to create account. Email may already be in use.");
      }

      if (data.emailVerificationPending) {
        setEmailVerificationPending(true);
      } else {
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
