"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, CreditCard, Shield, ChevronRight, AlertCircle } from "lucide-react";
import { useAccount } from "./layout";
import { fetchUserSubscriptions, fetchBillingOverview, fetchMyWallet } from "@/lib/api";
import { BrandLoader } from "@/components/brand-loader";
import {
  OverviewHero,
  OverviewStats,
  OverviewActiveSubscriptions,
  GettingStartedCard,
  type OverviewProduct,
} from "./_components";

export default function AccountPage() {
  const { user } = useAccount();
  const [products, setProducts] = useState<OverviewProduct[]>([]);
  const [billing, setBilling] = useState<any>(null);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [subsData, billingData, walletData] = await Promise.all([
          fetchUserSubscriptions(),
          fetchBillingOverview(),
          fetchMyWallet().catch(() => null),
        ]);
        const subs = Array.isArray(subsData) ? subsData : (subsData as any).subscriptions || [];
        setProducts(
          subs.map((s: any) => ({
            id: s.productId || s.saasProductId,
            name: s.productName || "Unknown Product",
            status: s.status === "active" ? "active" : "inactive",
            plan: s.plan || s.planType,
            renewalDate: s.endDate || s.expiresAt,
            expiresAt: s.expiresAt,
            domain: s.productDomain,
            tag: s.productTag || "Other Apps",
          }))
        );
        setBilling(billingData);
        if (walletData?.wallet) setCreditBalance(walletData.wallet.balance);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!user) return null;

  const displayName = user.name || user.email.split("@")[0];
  const activeProducts = products.filter((p) => p.status === "active").length;

  const monthlyCost =
    billing?.totalMonthlySpend !== undefined
      ? (billing.totalMonthlySpend / 100).toLocaleString("en-IN", {
          style: "currency",
          currency: billing.currency || "INR",
          minimumFractionDigits: 0,
        })
      : "₹0";

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";

  return (
    <div className="space-y-8 pb-12">
      <OverviewHero displayName={displayName} status={user.status} />

      <OverviewStats
        activeProducts={activeProducts}
        monthlyCost={monthlyCost}
        userStatus={user.status}
        memberSince={memberSince}
        creditBalance={creditBalance}
      />

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {/* ── Quick Nav ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { href: "/account/profile", Icon: User, label: "Profile", desc: "Personal info & avatar" },
          {
            href: "/account/subscriptions",
            Icon: CreditCard,
            label: "Subscriptions",
            desc: "Plans, billing & renewals",
          },
          {
            href: "/account/security",
            Icon: Shield,
            label: "Security",
            desc: "Password, 2FA & sessions",
          },
        ].map(({ href, Icon, label, desc }) => (
          <Link key={href} href={href}>
            <div className="group flex cursor-pointer items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md hover:shadow-violet-50">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100">
                <Icon size={16} className="text-violet-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <ChevronRight
                size={15}
                className="shrink-0 text-gray-300 transition-colors group-hover:text-violet-400"
              />
            </div>
          </Link>
        ))}
      </div>

      {/* ── Active Subscriptions ── */}
      {loading ? (
        <BrandLoader
          size="sm"
          text="Syncing subscriptions..."
          className="min-h-[160px] border border-gray-100 bg-white"
        />
      ) : (
        <OverviewActiveSubscriptions products={products} />
      )}

      {/* ── Getting Started ── */}
      <GettingStartedCard />
    </div>
  );
}