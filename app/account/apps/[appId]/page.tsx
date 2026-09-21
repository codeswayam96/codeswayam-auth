"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, XCircle, Zap, BarChart2,
  CreditCard, Crown, Sparkles, RefreshCw, ExternalLink,
  Layers, ArrowUpRight,
} from "lucide-react";
import { useAppAccess } from "@codeswayam/access";
import { Button } from "@/components/ui/button";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  free:       { bg: "bg-gray-100",   text: "text-gray-600",   border: "border-gray-200" },
  standard:   { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200" },
  pro:        { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  enterprise: { bg: "bg-amber-100",  text: "text-amber-700",  border: "border-amber-200" },
};

const STATUS_STYLES: Record<string, { label: string; badge: string; icon: React.ReactNode }> = {
  active:               { label: "Active",              badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={11} /> },
  past_due:             { label: "Past Due",            badge: "bg-red-50 text-red-700 border-red-200",             icon: <XCircle size={11} /> },
  canceled:             { label: "Canceled",            badge: "bg-gray-100 text-gray-500 border-gray-200",         icon: <XCircle size={11} /> },
  pending_cancellation: { label: "Cancellation Pending",badge: "bg-amber-50 text-amber-700 border-amber-200",       icon: <RefreshCw size={11} /> },
};

function TierIcon({ tier }: { tier: string }) {
  if (tier === "enterprise") return <Sparkles size={13} />;
  if (tier === "pro") return <Crown size={13} />;
  return null;
}

// ─── Usage Bar ────────────────────────────────────────────────────────────────

function UsageBar({ label, used, limit, percentage }: {
  label: string; used: number; limit: number; percentage: number;
}) {
  const isUnlimited = limit === -1;
  const numLimit = typeof limit === "number" ? limit : Number(limit) || 0;
  const numUsed = typeof used === "number" ? used : Number(used) || 0;
  const pct = isUnlimited ? 5 : Math.min(percentage ?? Math.round((numUsed / Math.max(1, numLimit)) * 100), 100);

  const barColor =
    isUnlimited ? "#22c55e"
    : pct >= 85 ? "#ef4444"
    : pct >= 60 ? "#f59e0b"
    : "#22c55e";

  return (
    <div className="p-4 rounded-xl border border-gray-200/80 bg-white hover:border-gray-300 transition-colors shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-bold text-gray-800 capitalize">
            {label.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()}
          </span>
          <span
            className="text-[12px] font-extrabold px-2 py-0.5 rounded-md border"
            style={{
              color: barColor,
              backgroundColor: `${barColor}12`,
              borderColor: `${barColor}30`,
            }}
          >
            {isUnlimited ? `${numUsed.toLocaleString()} / ∞` : `${numUsed.toLocaleString()} / ${numLimit.toLocaleString()}`}
          </span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
        <span>
          {isUnlimited ? "Unlimited usage" : `${Math.max(0, numLimit - numUsed).toLocaleString()} remaining`}
        </span>
        <span className="font-semibold">{pct}% used</span>
      </div>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse w-full">
      <div className="h-20 bg-gray-100 rounded-2xl border border-gray-200" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="h-44 bg-gray-100 rounded-2xl border border-gray-200" />
        <div className="h-44 bg-gray-100 rounded-2xl border border-gray-200" />
      </div>
      <div className="h-56 bg-gray-100 rounded-2xl border border-gray-200" />
      <div className="h-44 bg-gray-100 rounded-2xl border border-gray-200" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AppDetailPage({ params }: { params: Promise<{ appId: string }> }) {
  const { appId } = use(params);
  const decodedAppId = decodeURIComponent(appId);
  const access = useAppAccess(decodedAppId);

  const tier = access.tier.name;
  const tierStyle = TIER_COLORS[tier] ?? TIER_COLORS.standard;
  const creditCostEntries = Object.entries(access.credits.featureCosts ?? {});

  // Separate numeric usage meters from boolean feature toggles (prevents "0 / true" coercion bug)
  const { numericUsageEntries, booleanUsageEntries } = useMemo(() => {
    const rawUsage = Object.entries(access.usage ?? {});
    const numeric: [string, any][] = [];
    const booleanFlags: [string, boolean][] = [];

    for (const [key, counter] of rawUsage) {
      const limitVal: any = counter?.limit;
      if (typeof limitVal === "boolean" || limitVal === "true" || limitVal === "false") {
        booleanFlags.push([key, Boolean(limitVal === true || limitVal === "true")]);
      } else if (typeof limitVal === "number" && !isNaN(limitVal)) {
        numeric.push([key, counter]);
      } else if (!isNaN(Number(limitVal))) {
        numeric.push([key, { ...counter, limit: Number(limitVal) }]);
      } else {
        booleanFlags.push([key, Boolean(limitVal)]);
      }
    }

    return { numericUsageEntries: numeric, booleanUsageEntries: booleanFlags };
  }, [access.usage]);

  // Combine features from access.features and any boolean entries from usage
  const allFeatures = useMemo(() => {
    const featuresMap = new Map<string, boolean | number>();
    for (const [k, v] of Object.entries(access.features ?? {})) {
      featuresMap.set(k, v);
    }
    for (const [k, v] of booleanUsageEntries) {
      if (!featuresMap.has(k)) {
        featuresMap.set(k, v);
      }
    }
    return Array.from(featuresMap.entries());
  }, [access.features, booleanUsageEntries]);

  const subStatus = access.subscription?.status;
  const statusInfo = subStatus ? (STATUS_STYLES[subStatus] ?? { label: subStatus, badge: "bg-gray-100 text-gray-700 border-gray-200", icon: null }) : null;

  return (
    <div className="w-full space-y-6 pb-16">

      {/* ── Top Navigation & App Banner ── */}
      <div>
        <Link
          href="/account/apps"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-violet-700 transition-colors mb-4 group"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to My Apps
        </Link>

        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 flex items-center justify-center text-white font-black text-lg shadow-md shadow-violet-200 shrink-0">
              {decodedAppId.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-gray-900 capitalize tracking-tight">{decodedAppId}</h1>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${tierStyle.bg} ${tierStyle.text} border ${tierStyle.border}`}>
                  <TierIcon tier={tier} />
                  {access.tier.label}
                </span>
                {access.tier.aiIncluded && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    <Zap size={10} /> AI Included
                  </span>
                )}
                {statusInfo && (
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.badge}`}>
                    {statusInfo.icon}
                    {statusInfo.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Manage entitlements, live usage counters, credits, and active features for {decodedAppId}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => access.refresh()}
              className="h-9 gap-1.5 text-xs font-semibold rounded-xl"
            >
              <RefreshCw size={13} /> Refresh
            </Button>
            <Button
              size="sm"
              asChild
              className="h-9 gap-1.5 text-xs font-bold rounded-xl bg-violet-700 hover:bg-violet-800 text-white"
            >
              <Link href="/account/subscriptions">
                Manage Plan <ArrowUpRight size={13} />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Loading skeleton ── */}
      {!access.isLoaded && <PageSkeleton />}

      {access.isLoaded && (
        <>
          {/* ── Overview Grid: Subscription & Credits ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* 1. Subscription Card */}
            <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center">
                      <CreditCard size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">Subscription Overview</h2>
                      <p className="text-[11px] text-gray-400">Plan details and renewal schedule</p>
                    </div>
                  </div>
                  {statusInfo && (
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.badge}`}>
                      {statusInfo.icon} {statusInfo.label}
                    </span>
                  )}
                </div>

                {access.subscription ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Status</p>
                      <p className="text-sm font-extrabold text-gray-900 capitalize">{access.subscription.status.replace(/_/g, " ")}</p>
                    </div>
                    <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Plan</p>
                      <p className="text-sm font-extrabold text-gray-900 capitalize">{access.subscription.planType.replace(/_/g, " ")}</p>
                    </div>
                    <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Billing</p>
                      <p className="text-sm font-extrabold text-gray-900 capitalize">{access.subscription.billingCycle}</p>
                    </div>
                    <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Renews On</p>
                      <p className="text-sm font-extrabold text-gray-900">
                        {access.subscription.expiresAt
                          ? new Date(access.subscription.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-gray-400 text-xs">
                    No active paid subscription found for this app. Running on the Free tier.
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Need more capacity?</span>
                <Link
                  href="/account/subscriptions"
                  className="font-bold text-violet-700 hover:text-violet-900 inline-flex items-center gap-1"
                >
                  Change or Upgrade Plan <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>

            {/* 2. Credits Card */}
            <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-amber-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Zap size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">Credit Balance</h2>
                      <p className="text-[11px] text-gray-400">Universal balance for AI and heavy tasks</p>
                    </div>
                  </div>
                  <Link
                    href="/account/credits"
                    className="text-xs font-bold text-amber-700 hover:text-amber-900 inline-flex items-center gap-1"
                  >
                    Manage Credits <ExternalLink size={11} />
                  </Link>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full sm:w-44 bg-amber-100/60 border border-amber-200 rounded-xl p-4 text-center shrink-0">
                    <p className="text-3xl font-black text-amber-800 tracking-tight">
                      {(access.credits.balance ?? 0).toLocaleString()}
                    </p>
                    <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mt-0.5">Available Credits</p>
                  </div>

                  <div className="flex-1 w-full">
                    {creditCostEntries.length > 0 ? (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Feature Consumption Rates</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {creditCostEntries.map(([feature, cost]) => (
                            <div key={feature} className="flex items-center justify-between text-xs bg-white/80 border border-amber-100/80 rounded-lg px-2.5 py-1.5">
                              <span className="text-gray-600 capitalize truncate mr-2">{feature.replace(/_/g, " ")}</span>
                              <span className="font-extrabold text-amber-800 shrink-0">{cost} cr</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">
                        Credits are consumed automatically for AI generations and batch executions across all CodeSwayam apps.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-amber-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Refill or auto-recharge credits anytime.</span>
                <Link
                  href="/account/credits"
                  className="font-bold text-amber-800 hover:text-amber-950 inline-flex items-center gap-1"
                >
                  Add Credits <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>

          </div>

          {/* ── Usage Counters (2-Column Grid) ── */}
          {numericUsageEntries.length > 0 && (
            <div className="rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <BarChart2 size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Usage This Period</h2>
                    <p className="text-[11px] text-gray-400">Track current limits and active resource consumption</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                  {numericUsageEntries.length} Active {numericUsageEntries.length === 1 ? "Meter" : "Meters"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numericUsageEntries.map(([key, counter]) => (
                  <UsageBar
                    key={key}
                    label={key}
                    used={counter.used}
                    limit={counter.limit}
                    percentage={counter.percentage}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Feature Access (3-Column Grid) ── */}
          {allFeatures.length > 0 && (
            <div className="rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Feature Access &amp; Entitlements</h2>
                    <p className="text-[11px] text-gray-400">Capabilities and permissions unlocked by your current tier</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {allFeatures.filter(([_, v]) => v === true || (typeof v === "number" && v > 0)).length} Enabled
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allFeatures.map(([key, value]) => {
                  const enabled = value === true || (typeof value === "number" && value > 0);
                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                        enabled
                          ? "bg-emerald-50/40 border-emerald-200/80 shadow-2xs"
                          : "bg-gray-50/60 border-gray-200/60 opacity-60"
                      }`}
                    >
                      <span className={`font-semibold capitalize truncate mr-2 ${enabled ? "text-gray-800" : "text-gray-400"}`}>
                        {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()}
                      </span>
                      <span className="flex items-center gap-1 font-bold shrink-0">
                        {typeof value === "boolean" ? (
                          enabled ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={11} /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              <XCircle size={11} /> Locked
                            </span>
                          )
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                            {String(value)}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Empty State ── */}
          {!access.subscription && numericUsageEntries.length === 0 && allFeatures.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 px-6 text-center bg-white">
              <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <Layers size={22} />
              </div>
              <h3 className="text-base font-bold text-gray-900">No Entitlements Found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                No active subscription or usage counters are registered for {decodedAppId}. Subscribe to unlock full access.
              </p>
              <Button asChild size="sm" className="rounded-xl bg-violet-700 hover:bg-violet-800 text-white">
                <Link href="/account/subscriptions">
                  View Available Plans <ArrowUpRight size={13} className="ml-1" />
                </Link>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
