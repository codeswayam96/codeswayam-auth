"use client";

import React, { useState } from "react";
import { MailCheck, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorAlert } from "./ErrorAlert";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface VerificationNeededBannerProps {
  email: string;
  onBack: () => void;
  redirectUrl: string;
}

export function VerificationNeededBanner({
  email,
  onBack,
  redirectUrl,
}: VerificationNeededBannerProps) {
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
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 800);
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
            <CheckCircle size={16} />
            {resendMsg}
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
        <button className="text-sm text-primary hover:underline w-full text-center" onClick={onBack}>
          ← Back to login
        </button>
      </div>
    </div>
  );
}
