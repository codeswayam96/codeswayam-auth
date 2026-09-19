"use client";

import React, { useState } from "react";
import { Smartphone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorAlert } from "./ErrorAlert";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface TwoFactorChallengeProps {
  email: string;
  onBack: () => void;
  redirectUrl: string;
}

export function TwoFactorChallenge({
  email,
  onBack,
  redirectUrl,
}: TwoFactorChallengeProps) {
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
