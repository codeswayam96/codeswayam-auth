"use client";

import {
  AlertCircle, Calendar, Clock, Crown, Layers,
  Lock, RefreshCcw, TrendingUp, Trash2, Zap,
} from "lucide-react";
import Link from "next/link";
import type { UserSubscription } from "@/lib/api";
import type { PublicProduct, PublicBundle } from "@/types";
import { formatAmount, isSubscriptionExpired, normalizeKey } from "@/types";
import { StatusPill } from "./StatusPill";
import { TierBadge } from "./TierBadge";

interface SubscriptionCardProps {
  sub: UserSubscription;
  allProducts: PublicProduct[];
  allBundles: PublicBundle[];
  onUpgrade: (sub: UserSubscription) => void;
  onBundle: () => void;
  onCancel: (id: number) => void;
}

/**
 * SubscriptionCard — renders a single active (or pending-cancellation) plan row.
 * Handles expired state detection and distinct visual treatment automatically.
 */
export function SubscriptionCard({
  sub, allProducts, allBundles, onUpgrade, onBundle, onCancel,
}: SubscriptionCardProps) {
  const product = allProducts.find((p) => p.id === sub.saasProductId)
    ?? allProducts.find((p) => normalizeKey((p as any).saasId) === normalizeKey(sub.productSaasId));

  const planTier = product?.planTier || sub.planType?.toLowerCase();
  const isExpired = isSubscriptionExpired(sub.expiresAt);
  const effectiveStatus = isExpired ? "expired" : sub.status;

  const canCancel = (Date.now() - new Date(sub.createdAt).getTime()) <= 7 * 24 * 60 * 60 * 1000;

  return (
    <div
      className="rounded-xl border bg-white p-5 transition-shadow duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)]"
      style={isExpired
        ? { borderColor: "#fca5a5", backgroundColor: "#fffbfb", boxShadow: "0 0 0 2px rgba(239,68,68,0.08)" }
        : { borderColor: "#e5e7eb" }
      }
    >
      {/* Expired top banner */}
      {isExpired && (
        <div className="flex items-center gap-2 mb-4 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200">
          <Clock size={14} className="text-red-500 shrink-0" />
          <span className="text-xs font-semibold text-red-700 flex-1">
            This plan expired on{" "}
            <strong>{new Date(sub.expiresAt!).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong>.
            {" "}Access to features may be limited.
          </span>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600 text-white text-[11px] font-bold no-underline shrink-0 hover:bg-red-700 transition-colors"
          >
            <RefreshCcw size={10} /> Renew
          </Link>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Left: icon + info */}
        <div className="flex items-start gap-3.5 flex-1 min-w-[200px]">
          <div
            className="w-12 h-12 rounded-xl border flex items-center justify-center shrink-0"
            style={isExpired
              ? { backgroundColor: "#fee2e2", borderColor: "#fca5a5" }
              : { backgroundColor: "#f5f3ff", borderColor: "#ede9fe" }
            }
          >
            {sub.bundleId
              ? <Layers size={22} className={isExpired ? "text-red-400" : "text-violet-700"} />
              : <Zap size={22} className={isExpired ? "text-red-400" : "text-violet-700"} />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={`font-bold text-[15px] ${isExpired ? "text-gray-500" : "text-gray-900"}`}>
                {sub.productName || sub.bundleName || "Plan"}
              </span>
              <StatusPill status={effectiveStatus} />
              {planTier && <TierBadge tier={planTier} />}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border border-gray-200 text-gray-500 capitalize">
                {sub.billingCycle}
              </span>
              {sub.bundleId && (
                <span className="inline-flex items-center gap-[3px] px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 border border-violet-200">
                  <Crown size={9} /> Bundle
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-[13px] font-bold ${isExpired ? "text-gray-400 line-through" : "text-gray-900"}`}>
                {formatAmount(sub.amount, sub.currency)}/{sub.billingCycle === "yearly" ? "yr" : "mo"}
              </span>
              {sub.expiresAt && (
                <span className={`flex items-center gap-1 text-xs ${isExpired ? "text-red-500 font-semibold" : "text-gray-500"}`}>
                  {isExpired
                    ? <><Clock size={11} /> Expired {new Date(sub.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</>
                    : <><Calendar size={11} /> Renews {new Date(sub.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</>
                  }
                </span>
              )}
            </div>

            {(sub as any).rejectionReason && sub.status === "active" && (
              <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-100 text-red-800 text-xs leading-relaxed">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <p>
                  <span className="font-bold">Cancellation Rejected:</span> {(sub as any).rejectionReason}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          {isExpired ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-[5px] px-3.5 py-[7px] rounded-lg text-[13px] font-semibold bg-red-50 text-red-700 border border-red-200 transition-colors duration-150 hover:bg-red-100 no-underline"
            >
              <RefreshCcw size={14} /> Renew Now
            </Link>
          ) : (
            <>
              {!sub.bundleId && allProducts.length > 0 && (
                <button
                  onClick={() => onUpgrade(sub)}
                  className="inline-flex items-center gap-[5px] px-3.5 py-[7px] rounded-lg text-[13px] font-semibold bg-violet-100 text-violet-800 border border-violet-200 cursor-pointer transition-colors duration-150 hover:bg-violet-200"
                >
                  <TrendingUp size={14} /> Upgrade
                </button>
              )}
              {!sub.bundleId && allBundles.length > 0 && (
                <button
                  onClick={onBundle}
                  className="inline-flex items-center gap-[5px] px-3.5 py-[7px] rounded-lg text-[13px] font-semibold bg-transparent text-indigo-600 border border-indigo-200 cursor-pointer transition-colors duration-150 hover:bg-indigo-50"
                >
                  <Layers size={14} /> Bundle
                </button>
              )}
            </>
          )}

          {canCancel ? (
            <button
              onClick={() => onCancel(sub.id)}
              className="inline-flex items-center justify-center w-[34px] h-[34px] rounded-lg bg-transparent border border-gray-200 cursor-pointer text-gray-400 transition-all duration-150 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              title="Cancel Subscription (Available within 7 days of purchase)"
            >
              <Trash2 size={15} />
            </button>
          ) : (
            <button
              disabled
              className="inline-flex items-center justify-center w-[34px] h-[34px] rounded-lg bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
              title="Cancellation locked (Only available within 7 days of purchase)"
            >
              <Lock size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
