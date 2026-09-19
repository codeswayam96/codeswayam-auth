"use client";

import React from "react";
import Link from "next/link";
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  Lock,
  BarChart2,
} from "lucide-react";
import type { UserSubscription, SaasProduct } from "@/lib/api";
import { useAppAccess } from "@codeswayam/access";

export function formatAmount(amount: number, currency: string) {
  if (!amount) return "Free";
  const val = amount / 100;
  return currency === "INR"
    ? `₹${val.toLocaleString("en-IN")}`
    : `$${val.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export function formatDate(d?: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const STATUS_STYLES: Record<string, { label: string; badge: string; icon: React.ReactNode }> = {
  active:               { label: "Active",    badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={11} /> },
  past_due:             { label: "Past Due",  badge: "bg-red-50 text-red-700 border-red-200",             icon: <Clock size={11} /> },
  canceled:             { label: "Canceled",  badge: "bg-gray-100 text-gray-500 border-gray-200",         icon: <XCircle size={11} /> },
  pending_cancellation: { label: "Canceling", badge: "bg-amber-50 text-amber-700 border-amber-200",       icon: <Clock size={11} /> },
};

export const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  free:       { bg: "bg-gray-100",    text: "text-gray-600" },
  standard:   { bg: "bg-violet-100",  text: "text-violet-700" },
  pro:        { bg: "bg-orange-100",  text: "text-orange-700" },
  enterprise: { bg: "bg-amber-100",   text: "text-amber-700" },
};

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 animate-pulse space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gray-100 shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-gray-100 rounded w-32" />
          <div className="h-3 bg-gray-100 rounded w-20" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
      <div className="h-9 bg-gray-100 rounded-xl" />
    </div>
  );
}

export function AppUsageMeters({ appId }: { appId: string }) {
  const access = useAppAccess(appId);

  if (!access.isLoaded) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-4/5" />
      </div>
    );
  }

  const counters = Object.entries(access.usage);
  if (counters.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {counters.slice(0, 3).map(([key, counter]) => {
        const isUnlimited = counter.limit === -1;
        const pct = isUnlimited ? 5 : Math.min(counter.percentage, 100);
        const barColor =
          isUnlimited
            ? "#22c55e"
            : pct >= 80
            ? "#ef4444"
            : pct >= 60
            ? "#f59e0b"
            : "#22c55e";

        return (
          <div key={key}>
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span className="capitalize">{key.replace(/_/g, " ")}</span>
              <span>
                {isUnlimited ? `${counter.used} / ∞` : `${counter.used} / ${counter.limit}`}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${pct}%`, background: barColor }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AppCard({
  sub,
  product,
}: {
  sub: UserSubscription;
  product?: SaasProduct;
}) {
  const status = STATUS_STYLES[sub.status] ?? STATUS_STYLES.active;
  const isActive = sub.status === "active";
  const domain = sub.productDomain || product?.domain;
  const launchUrl = domain
    ? domain.startsWith("http")
      ? domain
      : `https://${domain}`
    : null;

  const name = sub.productName || product?.name || "Unknown App";
  const description = product?.description || "Platform application";
  const initials = name.slice(0, 2).toUpperCase();
  const tier = (product as any)?.planTier || sub.planType?.toLowerCase() || "standard";
  const tierStyle = TIER_COLORS[tier] ?? TIER_COLORS.standard;

  const appId =
    (product as any)?.saasId?.replace(/[_-](free|standard|pro|enterprise|basic|starter)$/i, "") ||
    (product as any)?.productFamily ||
    "";

  return (
    <div
      className={`group relative flex flex-col h-full rounded-2xl border bg-white overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        isActive ? "border-gray-200 hover:border-violet-200" : "border-gray-200 opacity-70"
      }`}
    >
      <div
        className={`h-[3px] ${
          isActive ? "bg-gradient-to-r from-violet-500 to-indigo-500" : "bg-gray-200"
        }`}
      />

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0 border ${
                isActive
                  ? "bg-gradient-to-br from-violet-100 to-indigo-100 border-violet-200 text-violet-700"
                  : "bg-gray-100 border-gray-200 text-gray-500"
              }`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${tierStyle.bg} ${tierStyle.text}`}
                >
                  {tier}
                </span>
                <span className="text-[10px] text-gray-400 capitalize">
                  {sub.billingCycle || "monthly"}
                </span>
              </div>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border shrink-0 ${status.badge}`}
          >
            <span className="shrink-0">{status.icon}</span>
            {status.label}
          </span>
        </div>

        <p className="text-[12px] text-gray-500 leading-relaxed mb-3 line-clamp-2">
          {description}
        </p>

        {isActive && appId && (
          <div className="mb-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-1 mb-2">
              <BarChart2 size={11} className="text-gray-400" />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Usage
              </span>
            </div>
            <AppUsageMeters appId={appId} />
          </div>
        )}

        <div className="mt-auto space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Amount</span>
            <span className="font-semibold text-gray-700">
              {formatAmount(sub.amount, sub.currency)}/
              {sub.billingCycle === "yearly" ? "yr" : "mo"}
            </span>
          </div>
          {sub.expiresAt && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-400">{isActive ? "Renews" : "Expired"}</span>
              <span className="font-semibold text-gray-700">{formatDate(sub.expiresAt)}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {appId && (
            <Link
              href={`/account/apps/${encodeURIComponent(appId)}`}
              className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-xl bg-gray-100 text-gray-600 text-[12px] font-semibold hover:bg-gray-200 transition-colors shrink-0"
            >
              Details
            </Link>
          )}
          {launchUrl ? (
            <a
              href={launchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 flex-1 h-8 rounded-xl text-[12px] font-semibold transition-all ${
                isActive
                  ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm shadow-violet-200"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
              }`}
            >
              {isActive ? (
                <>
                  <ExternalLink size={12} /> Launch
                </>
              ) : (
                <>
                  <Lock size={12} /> Inactive
                </>
              )}
            </a>
          ) : (
            <Link
              href="/account/subscriptions"
              className="flex items-center justify-center gap-2 flex-1 h-8 rounded-xl bg-gray-100 text-gray-500 text-[12px] font-semibold hover:bg-gray-200 transition-colors"
            >
              <Package size={12} /> Manage
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
