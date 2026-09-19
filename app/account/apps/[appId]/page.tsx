"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, XCircle, Zap, BarChart2,
  CreditCard, Crown, Sparkles, RefreshCw, ExternalLink,
} from "lucide-react";
import { useAppAccess } from "@codeswayam/access";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  free:       { bg: "bg-gray-100",   text: "text-gray-600",   border: "border-gray-200" },
  standard:   { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200" },
  pro:        { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  enterprise: { bg: "bg-amber-100",  text: "text-amber-700",  border: "border-amber-200" },
};

function TierIcon({ tier }: { tier: string }) {
  if (tier === "enterprise") return <Sparkles size={14} />;
  if (tier === "pro") return <Crown size={14} />;
  return null;
}

// ─── Usage Bar ────────────────────────────────────────────────────────────────

function UsageBar({ label, used, limit, percentage }: {
  label: string; used: number; limit: number; percentage: number;
}) {
  const isUnlimited = limit === -1;
  const pct = isUnlimited ? 5 : Math.min(percentage, 100);
  const barColor =
    isUnlimited ? "#22c55e"
    : pct >= 80 ? "#ef4444"
    : pct >= 60 ? "#f59e0b"
    : "#22c55e";

  return (
    <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-semibold text-gray-700 capitalize">{label.replace(/_/g, " ")}</span>
        <span className="text-[12px] font-bold" style={{ color: barColor }}>
          {isUnlimited ? `${used} / ∞` : `${used} / ${limit}`}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      {!isUnlimited && (
        <p className="text-[10px] text-gray-400 mt-1.5">
          {Math.max(0, limit - used)} remaining · {pct}% used
        </p>
      )}
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
  const usageEntries = Object.entries(access.usage);
  const featureEntries = Object.entries(access.features);
  const creditCostEntries = Object.entries(access.credits.featureCosts);

  return (
    <div className="space-y-6 pb-12 max-w-2xl">

      {/* ── Back + Header ── */}
      <div>
        <Link
          href="/account/apps"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4"
        >
          <ArrowLeft size={13} /> Back to My Apps
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 border border-violet-200 flex items-center justify-center text-sm font-extrabold text-violet-700">
                {decodedAppId.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900 capitalize">{decodedAppId}</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${tierStyle.bg} ${tierStyle.text} border ${tierStyle.border}`}>
                    <TierIcon tier={tier} />
                    {access.tier.label}
                  </span>
                  {access.tier.aiIncluded && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      <Zap size={9} /> AI Included
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => access.refresh()}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Loading skeleton ── */}
      {!access.isLoaded && (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl" />
          ))}
        </div>
      )}

      {access.isLoaded && (
        <>
          {/* ── Subscription ── */}
          {access.subscription && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={14} className="text-violet-600" />
                <h2 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Subscription</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Status", value: access.subscription.status },
                  { label: "Plan", value: access.subscription.planType },
                  { label: "Billing", value: access.subscription.billingCycle },
                  ...(access.subscription.expiresAt ? [{ label: "Renews", value: new Date(access.subscription.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-[13px] font-bold text-gray-800 capitalize">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Credits ── */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-amber-500" />
                <h2 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Credits</h2>
              </div>
              <Link
                href="/account/credits"
                className="text-[11px] font-semibold text-violet-600 hover:underline flex items-center gap-1"
              >
                Manage <ExternalLink size={10} />
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-amber-700">{access.credits.balance.toLocaleString()}</p>
                <p className="text-[11px] text-amber-600 font-semibold">Available Credits</p>
              </div>
              {creditCostEntries.length > 0 && (
                <div className="flex-1 space-y-1.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Feature Costs</p>
                  {creditCostEntries.map(([feature, cost]) => (
                    <div key={feature} className="flex items-center justify-between text-[12px]">
                      <span className="text-gray-600 capitalize">{feature.replace(/_/g, " ")}</span>
                      <span className="font-bold text-gray-800">{cost} cr</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Usage Counters ── */}
          {usageEntries.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 size={14} className="text-blue-600" />
                <h2 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Usage This Period</h2>
              </div>
              <div className="space-y-2.5">
                {usageEntries.map(([key, counter]) => (
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

          {/* ── Features ── */}
          {featureEntries.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <h2 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Feature Access</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {featureEntries.map(([key, value]) => {
                  const enabled = value === true || (typeof value === "number" && value > 0);
                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-[12px] ${
                        enabled ? "bg-emerald-50 border-emerald-100" : "bg-gray-50 border-gray-100 opacity-60"
                      }`}
                    >
                      <span className={`font-medium capitalize ${enabled ? "text-gray-700" : "text-gray-400"}`}>
                        {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()}
                      </span>
                      <span className="flex items-center gap-1 font-bold">
                        {typeof value === "boolean" ? (
                          enabled
                            ? <CheckCircle2 size={13} className="text-emerald-600" />
                            : <XCircle size={13} className="text-gray-300" />
                        ) : (
                          <span className={enabled ? "text-emerald-700" : "text-gray-400"}>{String(value)}</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── No data state ── */}
          {!access.subscription && usageEntries.length === 0 && featureEntries.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
              <p className="text-gray-400 text-sm">No entitlement data found for this app.</p>
              <Link
                href="/account/subscriptions"
                className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-violet-600 hover:underline"
              >
                View Subscriptions <ExternalLink size={12} />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
