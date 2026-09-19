"use client";

/**
 * Subscriptions Page — orchestrates data fetching and modal state.
 * UI is composed entirely from _components/. This file owns no JSX primitives.
 */

import { useEffect, useState, useCallback } from "react";
import { AlertCircle, Calendar, CreditCard, DollarSign, Package } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { BrandLoader } from "@/components/brand-loader";
import {
  fetchUserSubscriptions, cancelUserSubscription, fetchPublicPlans, fetchReferralStats,
  type UserSubscription, type ReferralStats,
} from "@/lib/api";
import { formatAmount, normalizeKey } from "@/types";
import type { PublicProduct, PublicBundle } from "@/types";

import { useAccount } from "../layout";
import {
  BundleUpsellModal, CancelDialog, PastSubscriptionRow,
  SubscriptionGroup, UpgradeModal,
} from "./_components";
import { Crown, Package as PkgIcon } from "lucide-react";

// ─── Stat Card (local to this page only) ─────────────────────────────────────

function StatCard({ label, value, iconBg, iconColor, icon }: {
  label: string; value: string; iconBg: string; iconColor: string; icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-[18px] flex items-center justify-between gap-3">
      <div>
        <p className="m-0 mb-1 text-xs text-gray-500 font-medium">{label}</p>
        <p className="m-0 text-[22px] font-extrabold text-gray-900 leading-tight">{value}</p>
      </div>
      <div
        className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        {icon}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  useAccount(); // ensures auth context is available
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") ?? undefined;

  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [allProducts, setAllProducts]     = useState<PublicProduct[]>([]);
  const [allBundles, setAllBundles]       = useState<PublicBundle[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [cancelling, setCancelling]       = useState<number | null>(null);
  const [cancelOpen, setCancelOpen]       = useState<number | null>(null);
  const [upgradeModal, setUpgradeModal]   = useState<UserSubscription | null>(null);
  const [bundleModal, setBundleModal]     = useState(false);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [subsData, plansData, refData] = await Promise.all([
        fetchUserSubscriptions(),
        fetchPublicPlans(),
        fetchReferralStats().catch(() => null),
      ]);
      setSubscriptions(Array.isArray(subsData) ? subsData : ((subsData as any)?.subscriptions ?? []));
      setAllProducts((plansData.products as any[]) ?? []);
      setAllBundles((plansData.bundles as any[]) ?? []);
      setReferralStats(refData);
    } catch (err: any) {
      setError(err.message ?? "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCancel = async (id: number) => {
    setCancelling(id);
    try {
      await cancelUserSubscription(id);
      setSubscriptions((prev) =>
        prev.map((s) => s.id === id ? { ...s, status: "pending_cancellation" as any } : s)
      );
      toast.success("Cancellation request submitted for admin approval");
      setCancelOpen(null);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to cancel");
    } finally {
      setCancelling(null);
    }
  };

  const activeSubscriptions   = subscriptions.filter((s) => s.status === "active" || s.status === "pending_cancellation");
  const inactiveSubscriptions = subscriptions.filter((s) => s.status !== "active" && s.status !== "pending_cancellation");

  const totalMonthlySpend = activeSubscriptions.reduce(
    (sum, s) => sum + (s.billingCycle === "yearly" ? Math.round(s.amount / 12) : s.amount),
    0
  );

  const nextRenewal = activeSubscriptions
    .filter((s) => s.expiresAt)
    .sort((a, b) => new Date(a.expiresAt!).getTime() - new Date(b.expiresAt!).getTime())[0];

  // Group active subs by product family for display
  const groupedActive = activeSubscriptions.reduce((acc, sub) => {
    const product = allProducts.find((p) => p.id === sub.saasProductId)
      ?? allProducts.find((p) => normalizeKey((p as any).saasId) === normalizeKey(sub.productSaasId));
    const family = normalizeKey(product?.productFamily
      ?? sub.productSaasId?.replace(/[_-](free|standard|pro|enterprise|basic|starter)$/i, ""))
      || sub.productName || "Other Apps";
    const label = product?.tag || sub.productName || family;
    if (!acc[family]) acc[family] = { label, subs: [] as UserSubscription[] };
    acc[family].subs.push(sub);
    return acc;
  }, {} as Record<string, { label: string; subs: UserSubscription[] }>);

  const activeSubProductIds = new Set(
    activeSubscriptions.map((s) => s.saasProductId).filter(Boolean) as number[]
  );

  if (loading) return <BrandLoader size="md" text="Syncing billing and plans..." />;

  return (
    <div className="flex flex-col gap-6 pb-12">

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Active Plans"   value={String(activeSubscriptions.length)}  iconBg="#dcfce7" iconColor="#16a34a" icon={<CreditCard size={17} />} />
        <StatCard label="Monthly Spend"  value={formatAmount(totalMonthlySpend, "INR")} iconBg="#ede9fe" iconColor="#7c3aed" icon={<DollarSign size={17} />} />
        <StatCard
          label="Next Renewal"
          value={nextRenewal?.expiresAt
            ? new Date(nextRenewal.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
            : "—"}
          iconBg="#dbeafe" iconColor="#2563eb" icon={<Calendar size={17} />}
        />
        <StatCard label="Past Plans" value={String(inactiveSubscriptions.length)} iconBg="#f3f4f6" iconColor="#6b7280" icon={<AlertCircle size={17} />} />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border-l-4 border-red-600 px-4 py-3 text-[13px] font-medium text-red-600">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {/* ── Bundle Upsell Banner ── */}
      {allBundles.length > 0 && activeSubscriptions.length > 0 && (
        <div className="relative rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-violet-100 px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden text-center sm:text-left">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none hidden sm:block">
            <Crown size={100} className="text-violet-700" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0">
              <Crown size={22} className="text-violet-700" />
            </div>
            <div>
              <p className="m-0 mb-0.5 font-bold text-sm text-gray-900">Unlock more with a Bundle</p>
              <p className="m-0 text-[13px] text-gray-500">Access multiple tools at a significantly lower price.</p>
            </div>
          </div>
          <button
            onClick={() => setBundleModal(true)}
            className="relative z-10 inline-flex items-center gap-1.5 px-[18px] py-2.5 rounded-lg text-[13px] font-bold bg-gradient-to-r from-violet-700 to-indigo-600 text-white border-none cursor-pointer shrink-0 w-full sm:w-auto justify-center"
          >
            <Crown size={14} /> View Bundles
          </button>
        </div>
      )}

      {/* ── Active Subscriptions ── */}
      {activeSubscriptions.length > 0 ? (
        <div className="space-y-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
              Active Plans ({activeSubscriptions.length})
            </span>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-[5px] px-3 py-[5px] rounded-md border border-gray-200 text-xs font-semibold text-gray-700 no-underline bg-white"
            >
              <Package size={12} /> Browse More
            </Link>
          </div>

          {Object.entries(groupedActive).map(([family, { label, subs }]) => (
            <SubscriptionGroup
              key={family}
              family={family}
              label={label}
              subscriptions={subs}
              allProducts={allProducts}
              allBundles={allBundles}
              onUpgrade={setUpgradeModal}
              onBundle={() => setBundleModal(true)}
              onCancel={setCancelOpen}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[14px] border border-gray-200 bg-white py-16 px-6 flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
            <CreditCard size={28} className="text-gray-300" />
          </div>
          <h3 className="m-0 text-lg font-bold text-gray-900">No Active Subscriptions</h3>
          <p className="m-0 text-sm text-gray-500 max-w-[340px]">
            Explore our product catalog and subscribe to your first SaaS tool — with instant access after payment.
          </p>
          <div className="flex gap-2.5 flex-wrap justify-center mt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-700 to-indigo-600 text-white text-sm font-semibold no-underline"
            >
              <PkgIcon size={15} /> Browse Products
            </Link>
            {allBundles.length > 0 && (
              <button
                onClick={() => setBundleModal(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 text-sm font-semibold cursor-pointer"
              >
                <Crown size={15} /> View Bundles
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Past Subscriptions ── */}
      {inactiveSubscriptions.length > 0 && (
        <div>
          <div className="h-px bg-gray-100 my-1 mb-4" />
          <span className="block text-[11px] font-extrabold uppercase tracking-widest text-gray-400 mb-2.5">
            Past Subscriptions
          </span>
          <div className="flex flex-col gap-2">
            {inactiveSubscriptions.map((sub) => (
              <PastSubscriptionRow key={sub.id} sub={sub} />
            ))}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {upgradeModal && (
        <UpgradeModal
          open={!!upgradeModal}
          onClose={() => setUpgradeModal(null)}
          currentSub={upgradeModal}
          allProducts={allProducts}
          referralStats={referralStats}
          returnUrl={returnUrl}
          activeSubProductIds={activeSubProductIds}
          onSuccess={loadData}
        />
      )}

      <BundleUpsellModal
        open={bundleModal}
        onClose={() => setBundleModal(false)}
        userSubscriptions={subscriptions}
        allBundles={allBundles}
        referralStats={referralStats}
        returnUrl={returnUrl}
        onSuccess={loadData}
      />

      <CancelDialog
        open={!!cancelOpen}
        onClose={() => setCancelOpen(null)}
        onConfirm={() => cancelOpen !== null && handleCancel(cancelOpen)}
        loading={cancelling === cancelOpen}
      />
    </div>
  );
}