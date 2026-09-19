"use client";

import React, { useState } from "react";
import { Link2, CheckCircle2, Copy } from "lucide-react";

interface ReferralCodeBoxProps {
  referralCode?: string;
}

export function ReferralCodeBox({ referralCode }: ReferralCodeBoxProps) {
  const [copiedType, setCopiedType] = useState<"code" | "link" | null>(null);

  const handleCopy = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopiedType("code");
    setTimeout(() => setCopiedType(null), 1800);
  };

  const handleCopyInviteLink = () => {
    if (!referralCode || typeof window === "undefined") return;
    navigator.clipboard.writeText(
      `${window.location.origin}/signup?ref=${encodeURIComponent(referralCode)}`
    );
    setCopiedType("link");
    setTimeout(() => setCopiedType(null), 1800);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-violet-50 to-white p-6 md:w-[60%] md:border-r md:border-violet-100">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-200/30 blur-3xl" />

      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1.5 shadow-sm">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-600">
          <Link2 size={10} color="#fff" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700">
          Your Referral Code
        </span>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-gray-500">
        Share this code or link with friends to earn bonus points for every sign‑up.
      </p>

      <div className="mb-4 inline-block rounded-xl border border-violet-200 bg-white px-5 py-3 shadow-sm shadow-violet-100">
        <p className="font-mono text-xl font-extrabold leading-none tracking-[0.18em] text-violet-700">
          {referralCode ?? "──────"}
        </p>
        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Referral code
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 active:opacity-80
            ${copiedType === "code" ? "bg-violet-800" : "bg-violet-600"}`}
        >
          {copiedType === "code" ? <CheckCircle2 size={14} /> : <Copy size={14} />}
          {copiedType === "code" ? "Copied!" : "Copy Code"}
        </button>
        <button
          type="button"
          onClick={handleCopyInviteLink}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-violet-50 active:bg-violet-100
            ${copiedType === "link" ? "text-violet-800" : "text-violet-600"}`}
        >
          {copiedType === "link" ? <CheckCircle2 size={14} /> : <Link2 size={14} />}
          {copiedType === "link" ? "Copied!" : "Copy Invite Link"}
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        💡 Share the invite link for easier one‑click redemption.
      </p>
    </div>
  );
}
