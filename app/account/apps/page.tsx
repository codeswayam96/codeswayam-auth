"use client";

import { useEffect, useState } from "react";
import {
  LayoutGrid, ExternalLink, Loader2, AlertCircle, RefreshCw,
  CheckCircle2, Clock, XCircle, Zap, Package, Globe, ArrowRight,
  Lock, Layers, Sparkles,
} from "lucide-react";
import { fetchUserSubscriptions, fetchSaasProducts } from "@/lib/api";
import type { UserSubscription, SaasProduct } from "@/lib/api";
import Link from "next/link";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(amount: number, currency: string) {
  if (!amount) return "Free";
  const val = amount / 100;
  return currency === "INR"
    ? `₹${val.toLocaleString("en-IN")}`
    : `$${val.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatDate(d?: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_STYLES: Record<string, { label: string; badge: string; icon: React.ReactNode }> = {
  active:               { label: "Active",              badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={11} /> },
  past_due:             { label: "Past Due",            badge: "bg-red-50 text-red-700 border-red-200",             icon: <Clock size={11} /> },
  canceled:             { label: "Canceled",            badge: "bg-gray-100 text-gray-500 border-gray-200",         icon: <XCircle size={11} /> },
  pending_cancellation: { label: "Canceling",           badge: "bg-amber-50 text-amber-700 border-amber-200",       icon: <Clock size={11} /> },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
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

// ─── App Card ─────────────────────────────────────────────────────────────────

function AppCard({ sub, product }: { sub: UserSubscription; product?: SaasProduct }) {
  const status = STATUS_STYLES[sub.status] ?? STATUS_STYLES.active;
  const isActive = sub.status === "active";
  const domain = sub.productDomain || product?.domain;
  const launchUrl = domain
    ? (domain.startsWith("http") ? domain : `https://${domain}`)
    : null;

  const name = sub.productName || product?.name || "Unknown App";
  const description = product?.description || "Platform application";
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className={`group relative flex flex-col h-full rounded-2xl border bg-white overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${isActive ? "border-gray-200 hover:border-violet-200" : "border-gray-200 opacity-70"}`}>
      {/* Top accent */}
      <div className={`h-[3px] ${isActive ? "bg-gradient-to-r from-violet-500 to-indigo-500" : "bg-gray-200"}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            {/* App icon */}
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0 border ${
              isActive
                ? "bg-gradient-to-br from-violet-100 to-indigo-100 border-violet-200 text-violet-700"
                : "bg-gray-100 border-gray-200 text-gray-500"
            }`}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 capitalize">
                {sub.billingCycle || "monthly"} · {sub.planType?.toLowerCase() || "standard"}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border shrink-0 ${status.badge}`}>
            <span className="shrink-0">{status.icon}</span>
            {status.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-[12px] text-gray-500 leading-relaxed mb-4 line-clamp-2">{description}</p>

        {/* Meta */}
        <div className="mt-auto space-y-2 mb-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Amount</span>
            <span className="font-semibold text-gray-700">{formatAmount(sub.amount, sub.currency)}/{sub.billingCycle === "yearly" ? "yr" : "mo"}</span>
          </div>
          {sub.expiresAt && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-400">{isActive ? "Renews" : "Expired"}</span>
              <span className="font-semibold text-gray-700">{formatDate(sub.expiresAt)}</span>
            </div>
          )}
          {domain && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-400">Domain</span>
              <span className="font-mono text-gray-600 truncate max-w-[140px]">{domain}</span>
            </div>
          )}
        </div>

        {/* Launch CTA */}
        {launchUrl ? (
          <a
            href={launchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 w-full h-9 rounded-xl text-[13px] font-semibold transition-all ${
              isActive
                ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm shadow-violet-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
            }`}
          >
            {isActive ? (
              <><ExternalLink size={13} /> Launch App</>
            ) : (
              <><Lock size={13} /> Inactive</>
            )}
          </a>
        ) : (
          <Link
            href="/account/subscriptions"
            className="flex items-center justify-center gap-2 w-full h-9 rounded-xl bg-gray-100 text-gray-500 text-[13px] font-semibold hover:bg-gray-200 transition-colors"
          >
            <Package size={13} /> Manage
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AppsPage() {
  const [subs, setSubs] = useState<UserSubscription[]>([]);
  const [products, setProducts] = useState<SaasProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setError("");
    try {
      const [subsData, prodsData] = await Promise.all([
        fetchUserSubscriptions().catch(() => []),
        fetchSaasProducts().catch(() => []),
      ]);
      const subsArr: UserSubscription[] = Array.isArray(subsData) ? subsData : (subsData as any)?.subscriptions ?? [];
      setSubs(subsArr);
      setProducts(Array.isArray(prodsData) ? prodsData : []);
    } catch (err: any) {
      setError(err.message || "Failed to load apps");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRefresh = () => { setRefreshing(true); load(); };

  const productMap = new Map(products.map(p => [String(p.id), p]));
  const activeSubs = subs.filter(s => s.status === "active");
  const inactiveSubs = subs.filter(s => s.status !== "active");

  return (
    <div className="space-y-6 pb-12">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-violet-800 px-6 py-7 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute right-16 bottom-0 opacity-[0.06]"><LayoutGrid size={140} /></div>
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">Platform</p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">My Apps</h1>
            <p className="mt-1.5 text-sm opacity-60 max-w-xs">
              All your subscribed platform applications in one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white text-violet-700 text-xs font-bold border border-white transition-colors hover:bg-violet-50"
            >
              <Sparkles size={13} /> Browse More Apps
            </Link>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      {!loading && subs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Active Apps", value: activeSubs.length, icon: <CheckCircle2 size={16} className="text-emerald-600" />, border: "border-emerald-100" },
            { label: "Total Apps", value: subs.length, icon: <LayoutGrid size={16} className="text-violet-600" />, border: "border-violet-100" },
            { label: "Inactive", value: inactiveSubs.length, icon: <XCircle size={16} className="text-gray-400" />, border: "border-gray-200" },
            { label: "Monthly Spend", value: `₹${activeSubs.reduce((s,sub) => s + (sub.billingCycle === "yearly" ? Math.round(sub.amount/12) : sub.amount), 0) / 100 | 0}`, icon: <Zap size={16} className="text-amber-600" />, border: "border-amber-100" },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-2xl border ${s.border} p-4 shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                {s.icon}
              </div>
              <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}

      {/* ── Active Apps ── */}
      {loading ? (
        <div>
          <p className="text-sm font-semibold text-gray-500 mb-3">Active Apps</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      ) : activeSubs.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <h2 className="text-sm font-bold text-gray-700">Active — {activeSubs.length} app{activeSubs.length !== 1 ? "s" : ""}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeSubs.map(sub => (
              <AppCard
                key={sub.id}
                sub={sub}
                product={sub.saasProductId ? productMap.get(String(sub.saasProductId)) : undefined}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-gray-200 shadow-sm">
            <Layers size={26} className="text-gray-300" />
          </div>
          <p className="text-base font-bold text-gray-900">No active apps</p>
          <p className="mt-1.5 text-sm text-gray-400 max-w-xs leading-relaxed">
            Subscribe to any product from the dashboard to see your apps here.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm"
          >
            <Globe size={14} /> Browse Products <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* ── Inactive/Expired ── */}
      {!loading && inactiveSubs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <XCircle size={16} className="text-gray-400" />
            <h2 className="text-sm font-bold text-gray-500">Inactive / Expired — {inactiveSubs.length}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {inactiveSubs.map(sub => (
              <AppCard
                key={sub.id}
                sub={sub}
                product={sub.saasProductId ? productMap.get(String(sub.saasProductId)) : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
