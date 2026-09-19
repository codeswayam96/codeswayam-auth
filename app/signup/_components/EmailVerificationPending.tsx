"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, MailCheck } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface EmailVerificationPendingProps {
  email: string;
  onReset: () => void;
  redirectUrl: string;
}

export function EmailVerificationPending({
  email,
  onReset,
  redirectUrl,
}: EmailVerificationPendingProps) {
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
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || "Invalid verification code.");

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
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
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
