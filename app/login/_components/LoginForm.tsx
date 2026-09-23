"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { ErrorAlert } from "./ErrorAlert";
import { VerificationNeededBanner } from "./VerificationNeededBanner";
import { TwoFactorChallenge } from "./TwoFactorChallenge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface LoginFormProps {
  redirectUrl: string;
  queryStr?: string;
}

export function LoginForm({ redirectUrl, queryStr }: LoginFormProps) {
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

      if (data.requiresVerification || data.emailVerificationPending) {
        fetch(`${API_URL}/auth/resend-verification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
          credentials: "include",
        }).catch(() => {});
        setVerificationNeeded(true);
        return;
      }

      if (data.requires2FA) {
        setRequires2FA(true);
        return;
      }

      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

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
            <Link
              href={`/forgot-password${queryStr ? `?${queryStr}` : ""}`}
              className="text-xs text-primary hover:underline"
            >
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
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
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
