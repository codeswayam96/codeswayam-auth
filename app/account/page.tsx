"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAccount } from "./layout";
import Link from "next/link";
import {
  User, CreditCard, Settings, ArrowRight, Zap,
  AlertCircle, Loader2, TrendingUp, Clock, ShoppingCart,
  ChevronRight, Package, BookOpen, Shield, Wallet, Tag,
} from "lucide-react";
import { fetchUserSubscriptions, fetchBillingOverview, fetchMyWallet } from "@/lib/api";
import { BrandLoader } from "@/components/brand-loader";

interface SaaSProduct {
  id: string;
  name: string;
  status: "active" | "inactive";
  plan?: string;
  renewalDate?: string;
  domain?: string;
  tag?: string;
}

export default function AccountPage() {
  const { user } = useAccount();
  const [products, setProducts] = useState<SaaSProduct[]>([]);
  const [billing,  setBilling]  = useState<any>(null);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    (async () => {
      try {
        const [subsData, billingData, walletData] = await Promise.all([
          fetchUserSubscriptions(),
          fetchBillingOverview(),
          fetchMyWallet().catch(() => null),
        ]);
        const subs = Array.isArray(subsData) ? subsData : (subsData as any).subscriptions || [];
        setProducts(subs.map((s: any) => ({
          id:          s.productId || s.saasProductId,
          name:        s.productName || "Unknown Product",
          status:      s.status === "active" ? "active" : "inactive",
          plan:        s.plan || s.planType,
          renewalDate: s.endDate || s.expiresAt,
          domain:      s.productDomain,
          tag:         s.productTag || "Other Apps",
        })));
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

  const displayName    = user.name || user.email.split("@")[0];
  const activeProducts = products.filter(p => p.status === "active").length;

  const monthlyCost = billing?.totalMonthlySpend !== undefined
    ? (billing.totalMonthlySpend / 100).toLocaleString("en-IN", {
        style: "currency", currency: billing.currency || "INR", minimumFractionDigits: 0,
      })
    : "₹0";

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";

  return (
    <div className="space-y-8 pb-12">

      {/* ── Welcome hero ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-violet-100/60 to-white px-8 py-7">
        {/* decorative rings */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border-[28px] border-violet-200/50" />
        <div className="pointer-events-none absolute -right-3 -top-3 h-20 w-20 rounded-full border-[12px] border-violet-300/30" />

        <div className="flex flex-wrap items-center gap-5">
          {/* avatar */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-300">
            <span className="text-2xl font-extrabold text-white">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-violet-600">My Account</p>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Welcome back, <span className="text-violet-600">{displayName}</span> 👋
            </h1>
            <p className="mt-1 text-sm text-gray-500">All your subscriptions and settings in one place.</p>
          </div>

          {/* status badge */}
          <div className="flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            {user.status || "Active"}
          </div>
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">

        <Card className="overflow-hidden border-gray-100 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Active Products</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                <Package size={15} className="text-violet-600" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-gray-900">{activeProducts}</p>
            <div className="mt-3 h-1 w-full rounded-full bg-violet-100">
              <div className="h-1 rounded-full bg-violet-500 transition-all duration-500"
                style={{ width: `${Math.min(activeProducts * 25, 100)}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-gray-100 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Monthly Cost</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                <TrendingUp size={15} className="text-emerald-600" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-gray-900">{monthlyCost}</p>
            <div className="mt-3 h-1 w-full rounded-full bg-emerald-100">
              <div className="h-1 w-3/5 rounded-full bg-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-gray-100 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Account Status</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                <Zap size={15} className="text-violet-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${user.status === "inactive" ? "bg-amber-400" : "bg-green-500"}`} />
              <span className="text-xl font-extrabold capitalize text-gray-900">{user.status || "Active"}</span>
            </div>
            <div className="mt-3 h-1 w-full rounded-full bg-violet-100">
              <div className="h-1 w-full rounded-full bg-violet-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-gray-100 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Member Since</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                <Clock size={15} className="text-amber-500" />
              </div>
            </div>
            <p className="mt-3 text-xl font-extrabold text-gray-900">{memberSince}</p>
            <div className="mt-3 h-1 w-full rounded-full bg-amber-100">
              <div className="h-1 w-2/5 rounded-full bg-amber-400" />
            </div>
          </CardContent>
        </Card>

        {/* Credit Balance card */}
        <Link href="/account/credits" className="col-span-2 md:col-span-1">
          <Card className="overflow-hidden border-indigo-100 shadow-sm bg-gradient-to-br from-indigo-50 to-violet-50 h-full hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Credits</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                  <Zap size={15} className="text-indigo-600" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-indigo-900">
                {creditBalance !== null ? creditBalance.toLocaleString() : "—"}
              </p>
              <p className="text-[10px] font-bold text-indigo-400 mt-0.5">pts available</p>
              <div className="mt-3 h-1 w-full rounded-full bg-indigo-100">
                <div className="h-1 w-1/2 rounded-full bg-indigo-400" />
              </div>
            </CardContent>
          </Card>
        </Link>

      </div>

      {/* ── Error ────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {/* ── Quick nav ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { href: "/account/profile",       Icon: User,       label: "Profile",       desc: "Personal info & avatar" },
          { href: "/account/subscriptions", Icon: CreditCard, label: "Subscriptions", desc: "Plans, billing & renewals" },
          { href: "/account/security",      Icon: Shield,     label: "Security",      desc: "Password, 2FA & sessions" },
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
              <ChevronRight size={15} className="shrink-0 text-gray-300 transition-colors group-hover:text-violet-400" />
            </div>
          </Link>
        ))}
      </div>

      {/* ── Subscriptions ────────────────────────────────────────────── */}
      {loading ? (
        <BrandLoader size="sm" text="Syncing subscriptions..." className="min-h-[160px] border border-gray-100 bg-white" />

      ) : products.filter(p => p.status === "active").length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* header */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-6 py-4">
            <div className="flex items-center gap-2">
              <CreditCard size={15} className="text-violet-600" />
              <span className="text-sm font-bold text-gray-900">Active Subscriptions</span>
            </div>
            <span className="rounded-full bg-violet-100 px-3 py-0.5 text-xs font-bold text-violet-700">
              {products.filter(p => p.status === "active").length} active
            </span>
          </div>

          {/* grouped rows */}
          <div className="divide-y divide-gray-100">
            {Object.entries(
              products
                .filter(p => p.status === "active")
                .reduce((acc, p) => {
                  const tag = p.tag || "Other Apps";
                  if (!acc[tag]) acc[tag] = [];
                  acc[tag].push(p);
                  return acc;
                }, {} as Record<string, SaaSProduct[]>)
            ).map(([tag, groupProducts]) => (
              <div key={tag} className="px-6 py-4 space-y-3 bg-white">
                {/* group header */}
                <div className="flex items-center gap-2">
                  <Tag size={13} className="text-violet-500" />
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    {tag.replace(/-/g, " ")}
                  </span>
                  <span className="bg-violet-50 text-violet-600 text-[9px] font-bold px-1.5 py-px rounded-full border border-violet-100">
                    {groupProducts.length} {groupProducts.length === 1 ? 'plan' : 'plans'}
                  </span>
                </div>
                
                {/* products in group */}
                <div className="space-y-2.5">
                  {groupProducts.map((product, i) => (
                    <div
                      key={`${product.id}-${i}`}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-50 bg-gray-50/30 transition-colors hover:bg-gray-50/80"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-100 bg-white">
                          <Zap size={15} className="text-violet-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{product.name}</p>
                          <div className="mt-0.5 flex items-center gap-2">
                            {product.plan && (
                              <span className="text-[10px] font-bold text-violet-600">
                                {product.plan}
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400">
                              Renews {product.renewalDate
                                ? new Date(product.renewalDate).toLocaleDateString("en-IN")
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <a
                        href={product.domain ? `https://${product.domain}` : "/account/subscriptions"}
                        target={product.domain ? "_blank" : "_self"}
                        rel={product.domain ? "noopener noreferrer" : undefined}
                        className="flex items-center gap-1.5 rounded-lg border border-violet-200 px-3 py-1.5 text-[11px] font-semibold text-violet-700 transition-colors hover:bg-violet-600 hover:text-white hover:border-violet-600"
                      >
                        {product.domain ? "Open App" : "Manage"} <ArrowRight size={10} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="border-t border-gray-100 p-4">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white shadow-sm shadow-violet-200 transition-opacity hover:opacity-90"
            >
              <ShoppingCart size={15} /> Browse More Products
            </Link>
          </div>

        </div>

      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-14 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
            <ShoppingCart size={24} className="text-violet-600" />
          </div>
          <p className="text-base font-bold text-gray-900">No active subscriptions</p>
          <p className="mt-1 max-w-xs text-sm text-gray-400">Explore products and subscribe to see them here.</p>
          <Link
            href="/dashboard"
            className="mt-6 flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm shadow-violet-200 hover:opacity-90 transition-opacity"
          >
            <ShoppingCart size={14} /> Browse Products
          </Link>
        </div>
      )}

      {/* ── Getting started ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-violet-200 bg-violet-50/60 px-7 py-6">
        <div className="mb-5 flex items-center gap-2">
          <BookOpen size={15} className="text-violet-600" />
          <p className="text-sm font-bold text-violet-700">Getting Started</p>
        </div>

        <div className="space-y-5">
          {[
            { Icon: Package, title: "Browse Our Products",    desc: "Explore all available SaaS tools and subscribe to what you need.", href: "/dashboard" },
            { Icon: Shield,  title: "Secure Your Account",    desc: "Enable two-factor authentication for stronger protection.",        href: "/account/security" },
            { Icon: Wallet,  title: "Manage Payment Methods", desc: "Add a payment method for seamless automatic billing.",            href: "/account/billing" },
          ].map(({ Icon, title, desc, href }, i, arr) => (
            <div key={title}>
              <Link href={href} className="group flex items-start gap-4 no-underline">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-200 bg-white group-hover:border-violet-600 group-hover:bg-violet-600 transition-colors">
                  <Icon size={14} className="text-violet-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 group-hover:text-violet-700 transition-colors">{title}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{desc}</p>
                </div>
              </Link>
              {i < arr.length - 1 && <Separator className="mt-5 bg-violet-200/50" />}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}