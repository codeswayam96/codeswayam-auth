"use client";

import React, { useState } from "react";
import { Gift, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { redeemReferralCode } from "@/lib/api";

interface RedeemCodeFormProps {
  onSuccess: () => void;
}

export function RedeemCodeForm({ onSuccess }: RedeemCodeFormProps) {
  const [friendCode, setFriendCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleRedeemFriendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendCode.trim()) return;
    setRedeemMessage(null);
    setRedeeming(true);
    try {
      const res = await redeemReferralCode(friendCode.trim());
      setRedeemMessage({
        type: "success",
        text: `${res.message} (+${res.pointsAwarded} points)`,
      });
      setFriendCode("");
      onSuccess();
    } catch (err: any) {
      setRedeemMessage({
        type: "error",
        text: err?.message || "Failed to redeem referral code",
      });
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="flex flex-col justify-center bg-white p-6 md:w-[40%]">
      <div className="mb-1 flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-100 bg-amber-50">
          <Gift size={14} className="text-amber-500" />
        </span>
        <h3 className="text-base font-bold text-gray-900">Have a friend&apos;s code?</h3>
      </div>
      <p className="mb-5 pl-9 text-sm text-gray-500">
        Redeem once and get instant bonus points in your wallet.
      </p>

      <form onSubmit={handleRedeemFriendCode} className="flex flex-col gap-2.5">
        <Input
          value={friendCode}
          onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
          placeholder="e.g. FRIEND42"
          className="h-10 font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal"
        />
        <button
          type="submit"
          disabled={redeeming || !friendCode.trim()}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {redeeming ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
          {redeeming ? "Redeeming…" : "Redeem Code"}
        </button>
      </form>

      {redeemMessage && (
        <div
          className={`mt-3 rounded-lg border px-4 py-2.5 text-sm ${
            redeemMessage.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {redeemMessage.text}
        </div>
      )}
    </div>
  );
}
