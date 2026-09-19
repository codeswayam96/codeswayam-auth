"use client";

import { useState } from "react";
import {
  ArrowDownRight, ArrowUpRight, Coins, CheckCircle2,
  Loader2, ShoppingCart, Star,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { CreditPack, ReferralStats } from "@/lib/api";

// ─── TX type config (shared with TxRow) ───────────────────────────────────────

export type TxType = "purchase" | "usage" | "refund" | "bonus" | "adjustment" | "expiry";

export const TX_CONFIG: Record<TxType, { label: string; pill: string; icon: string }> = {
  purchase:   { label: "Purchase",   pill: "bg-green-50 text-green-700 border-green-200",    icon: "text-green-600" },
  usage:      { label: "Used",       pill: "bg-red-50 text-red-700 border-red-200",          icon: "text-red-600" },
  refund:     { label: "Refund",     pill: "bg-blue-50 text-blue-700 border-blue-200",       icon: "text-blue-600" },
  bonus:      { label: "Bonus",      pill: "bg-violet-50 text-violet-700 border-violet-200", icon: "text-violet-600" },
  adjustment: { label: "Adjustment", pill: "bg-amber-50 text-amber-700 border-amber-200",   icon: "text-amber-600" },
  expiry:     { label: "Expired",    pill: "bg-gray-50 text-gray-600 border-gray-200",       icon: "text-gray-500" },
};

function formatInr(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

interface PackCardProps {
  pack: CreditPack;
  onBuy: (pack: CreditPack, usePoints: boolean) => void;
  buying: boolean;
  referralStats: ReferralStats | null;
}

/**
 * PackCard — credit pack tile with points discount toggle and CTA.
 */
export function PackCard({ pack, onBuy, buying, referralStats }: PackCardProps) {
  const [usePoints, setUsePoints] = useState(false);

  const activePoints = referralStats?.points?.active ?? 0;
  let ptsUsed = 0;
  let discountAmount = 0;

  if (usePoints && activePoints > 0) {
    const maxDiscount = (pack.priceInr * 30) / 100;
    const pointsValue = activePoints / 10;
    discountAmount = Math.min(maxDiscount, pointsValue * 100);
    ptsUsed = Math.ceil((discountAmount / 100) * 10);
  }

  const totalPts   = pack.points + (pack.bonusPoints ?? 0);
  const priceRs    = pack.priceInr / 100;
  const ptsPerRupee = (totalPts / priceRs).toFixed(1);
  const popular    = pack.isPopular === 1;

  return (
    <div className={`relative flex flex-col gap-4 overflow-hidden rounded-2xl border-2 p-6 transition-shadow ${popular
      ? "border-violet-600 bg-violet-50 shadow-lg shadow-violet-100"
      : "border-gray-200 bg-white shadow-sm"}`}
    >
      {popular && (
        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
          <Star size={9} fill="white" /> Popular
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${popular
          ? "bg-gradient-to-br from-violet-600 to-indigo-600"
          : "bg-gradient-to-br from-gray-200 to-gray-300"}`}
        >
          <Coins size={22} className={popular ? "text-white" : "text-gray-500"} />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-gray-900">{pack.name}</h3>
          {pack.description && <p className="text-xs text-gray-500">{pack.description}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-4xl font-black text-gray-900 leading-none">{totalPts.toLocaleString()}</span>
        <span className="text-sm font-semibold text-gray-500">pts</span>
        {(pack.bonusPoints ?? 0) > 0 && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
            +{pack.bonusPoints} bonus
          </span>
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">
        <div className="flex flex-col">
          {usePoints && discountAmount > 0 && (
            <span className="text-[10px] font-bold text-gray-400 line-through mb-[-2px]">{formatInr(pack.priceInr)}</span>
          )}
          <span className="text-2xl font-black text-violet-600">
            {formatInr(usePoints ? Math.max(0, pack.priceInr - discountAmount) : pack.priceInr)}
          </span>
        </div>
        <span className="text-xs font-semibold text-gray-400">≈ {ptsPerRupee} pts/₹</span>
      </div>

      <div className={`rounded-xl border p-3 transition-colors ${activePoints > 0
        ? "border-amber-200 bg-amber-50/50"
        : "border-gray-100 bg-gray-50/50 opacity-80"}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Star size={14} className={activePoints > 0 ? "text-amber-500" : "text-gray-400"} fill="currentColor" />
            <span className="text-[11px] font-bold text-gray-700">Use Referral Points</span>
          </div>
          <Switch checked={usePoints} onCheckedChange={setUsePoints} className="scale-75 origin-right" disabled={activePoints <= 0} />
        </div>
        {usePoints && activePoints > 0 && (
          <div className="mt-2 pt-2 border-t border-amber-200/30 flex items-center justify-between text-[10px] font-bold text-amber-700">
            <span>Applying {ptsUsed.toLocaleString()} points</span>
            <span>-{formatInr(discountAmount)}</span>
          </div>
        )}
        {activePoints <= 0 && <p className="mt-1.5 text-[9px] font-medium text-gray-400">No active referral points to redeem.</p>}
      </div>

      <button
        onClick={() => onBuy(pack, usePoints)}
        disabled={buying}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60 ${popular
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90"
          : "bg-gradient-to-r from-gray-700 to-gray-900 hover:opacity-90"}`}
      >
        {buying ? <Loader2 size={15} className="animate-spin" /> : <ShoppingCart size={15} />}
        {buying ? "Processing…" : `Buy ${totalPts.toLocaleString()} pts`}
      </button>
    </div>
  );
}

// ─── TxRow ─────────────────────────────────────────────────────────────────────

import type { CreditTransaction } from "@/lib/api";

interface TxRowProps { tx: CreditTransaction }

/**
 * TxRow — single transaction row in the history tab.
 */
export function TxRow({ tx }: TxRowProps) {
  const cfg     = TX_CONFIG[tx.type as TxType] ?? TX_CONFIG.adjustment;
  const isDebit = tx.points < 0;

  return (
    <div className="flex items-center gap-3 border-b border-gray-50 px-4 py-3 last:border-b-0">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${cfg.pill}`}>
        {isDebit
          ? <ArrowUpRight size={15} className={cfg.icon} />
          : <ArrowDownRight size={15} className={cfg.icon} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{tx.description}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${cfg.pill}`}>{cfg.label}</span>
          <span className="text-[10px] text-gray-400">
            {new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className={`text-sm font-extrabold ${isDebit ? "text-red-600" : "text-green-600"}`}>
          {isDebit ? "" : "+"}{tx.points.toLocaleString()} pts
        </p>
        <p className="text-[10px] text-gray-400">bal: {tx.balanceAfter.toLocaleString()}</p>
      </div>
    </div>
  );
}

// ─── Trust Note ───────────────────────────────────────────────────────────────

/**
 * CreditsTrustNote — secure payment note shown below pack grid.
 */
export function CreditsTrustNote() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 px-5 py-4">
      <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-violet-600" />
      <div>
        <p className="text-sm font-bold text-violet-700">Secure payments via Razorpay</p>
        <p className="mt-0.5 text-xs text-gray-500">
          Credits are added instantly after payment. No subscription — buy once, use anytime across all CodeSwayam platforms.
        </p>
      </div>
    </div>
  );
}
