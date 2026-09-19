"use client";

/**
 * Dashboard Page — orchestrates product catalog display.
 * Owns: data fetching, filter state, coupon redemption.
 * UI: composed from _components/. Hero banner kept inline (page-specific, not reusable).
 */

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  AlertCircle, ArrowRight, Crown, Layers, Loader2,
  Package, Search, Sparkles, Tag, Zap,
} from "lucide-react";
import Link from "next/link";
import { fetchPublicPlans, redeemCouponCode } from "@/lib/api";

import { BundleCard, FilterBar, ProductCard } from "./_components";
import type { Bundle, BillingCycle, SaaSProduct } from "./_components";

// ─── Dashboard-only BillingToggle (different visual style from subscriptions) ──

function BillingToggle({ cycle, onChange }: { cycle: BillingCycle; onChange: (c: BillingCycle) => void }) {
  return (
    <div className="inline-flex items-center rounded-full border border-white/25 bg-white/10 p-1 gap-1 w-full sm:w-auto">
      {(["monthly", "yearly"] as const).map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold border-none cursor-pointer transition-all duration-200 ${
            cycle === opt ? "bg-white text-violet-700 shadow-sm" : "bg-transparent text-white/75"
          }`}
        >
          {opt === "monthly" ? "Monthly" : "Yearly"}
          {opt === "yearly" && (
            <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${
              cycle === "yearly" ? "bg-violet-100 text-violet-700" : "bg-emerald-400/25 text-emerald-100"
            }`}>
              -17%
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const productsRef  = useRef<HTMLElement>(null);

  const [products, setProducts]       = useState<SaaSProduct[]>([]);
  const [bundles, setBundles]         = useState<Bundle[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [searchTerm, setSearchTerm]   = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(searchParams.get("app") ?? null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [couponCode, setCouponCode]   = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeemError, setRedeemError]     = useState<string | null>(null);

  const redirectAfterPayment = searchParams.get("redirect") ?? "/account/subscriptions";

  const handleFilterChange = (cat: string | null) => {
    setFilterCategory(cat);
    const params = new URLSearchParams(searchParams.toString());
    if (cat) params.set("app", cat); else params.delete("app");
    router.replace(`/dashboard?${params.toString()}`, { scroll: false });
    setTimeout(() => productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  useEffect(() => {
    if (searchParams.get("app")) {
      setTimeout(() => productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    }
  }, [loading]); // run after products load

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    setIsRedeeming(true); setRedeemError(null); setRedeemSuccess(null);
    try {
      const res = await redeemCouponCode(couponCode);
      if (res.success) {
        setRedeemSuccess(res.message ?? `Success! Activated ${res.productName || res.bundleName || "plan"}.`);
        setCouponCode("");
      } else {
        setRedeemError(res.message);
      }
    } catch (err: any) {
      setRedeemError(err.message ?? "Failed to redeem code");
    } finally {
      setIsRedeeming(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchPublicPlans();
        const mappedProducts: SaaSProduct[] = (data.products ?? []).map((p: any) => ({
          id: p.id.toString(), saasId: p.saasId, productFamily: p.productFamily || p.saasId,
          name: p.name, description: p.description || "Powerful SaaS product",
          category: p.tag || "Productivity",
          monthlyInr: p.pricing?.INR?.monthly ?? p.monthlyPriceInr ?? 0,
          yearlyInr:  p.pricing?.INR?.yearly  ?? p.yearlyPriceInr  ?? 0,
          monthlyUsd: p.pricing?.USD?.monthly ?? p.monthlyPriceUsd ?? 0,
          yearlyUsd:  p.pricing?.USD?.yearly  ?? p.yearlyPriceUsd  ?? 0,
          status: p.status || "active", planTier: p.planTier || "standard",
          isFreeTier: Boolean(p.isFreeTier),
          features: Array.isArray(p.features) ? p.features : [],
        }));
        const mappedBundles: Bundle[] = (data.bundles ?? []).map((b: any) => ({
          id: b.id.toString(), name: b.name, description: b.description || "",
          monthlyInr: b.pricing?.INR?.monthly ?? (b.price ? b.price * 100 : 0),
          yearlyInr:  b.pricing?.INR?.yearly  ?? 0,
          monthlyUsd: b.pricing?.USD?.monthly ?? 0,
          yearlyUsd:  b.pricing?.USD?.yearly  ?? 0,
          features: Array.isArray(b.features) ? b.features : ["All included products", "Priority support", "Bundle discount"],
        }));
        setProducts(mappedProducts);
        setBundles(mappedBundles);
      } catch (err: any) {
        setError(err.message ?? "Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (!filterCategory || p.productFamily === filterCategory);
  });

  const categories = Array.from(new Set(products.map((p) => p.productFamily)));
  const productCountByCategory = categories.reduce((acc, cat) => {
    acc[cat] = products.filter((p) => p.productFamily === cat).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-violet-700" />
          <p className="text-sm font-medium text-gray-500">Loading product catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12">

      {/* ── Hero ── */}
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-violet-900 via-violet-700 to-indigo-600 text-white relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/[0.06]" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/[0.06]" />
        </div>
        <div className="relative z-10 px-5 sm:px-10 py-7 sm:py-9">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold uppercase tracking-widest text-white/90 mb-4">
            <Sparkles size={12} /> SaaS Marketplace
          </div>
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="flex-1 min-w-full sm:min-w-[300px]">
              <h1 className="text-[clamp(22px,3.5vw,34px)] font-black leading-tight m-0 mb-2.5 text-white">The Tools Your Business Deserves</h1>
              <p className="text-[15px] text-white/80 leading-relaxed m-0 mb-6 max-w-[460px]">
                Subscribe to individual products or unlock the full bundle — one dashboard, all your software.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-white/90">
                  <Package size={14} /> {products.length} Pro Apps
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-white/90">
                  <Layers size={14} /> {bundles.length} Bundles
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-400/15 border border-emerald-300/30 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-emerald-300">
                  <Zap size={14} /> Instant Access
                </div>
              </div>
            </div>
            <div className="shrink-0 flex flex-col gap-4 w-full sm:w-auto sm:min-w-[260px]">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-[14px] p-5 flex flex-col gap-3">
                <p className="m-0 text-[11px] font-bold text-white/70 uppercase tracking-wider">Billing Cycle</p>
                <BillingToggle cycle={billingCycle} onChange={setBillingCycle} />
                <div className="border-t border-white/15 pt-3 flex gap-2">
                  <Link href="/account/subscriptions" className="flex-1 flex items-center justify-center py-2 rounded-lg bg-white/10 border border-white/15 text-white/85 text-[13px] font-semibold no-underline">
                    Subscriptions
                  </Link>
                  <Link href="/account/credits" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white text-violet-700 text-[13px] font-bold no-underline">
                    <Zap size={14} /> Buy Points
                  </Link>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-[14px] p-4">
                <p className="m-0 mb-2 text-[11px] font-bold text-white/70 uppercase tracking-wider">Redeem Code</p>
                <form onSubmit={handleRedeem} className="flex flex-col gap-2">
                  <div className="flex gap-1.5">
                    <input
                      value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter code"
                      className="flex-1 px-3 py-2 rounded-md border border-white/30 bg-black/10 text-white text-[13px] outline-none placeholder:text-white/50"
                    />
                    <button disabled={isRedeeming || !couponCode} className="px-3.5 py-2 rounded-md bg-emerald-400 text-emerald-950 font-bold text-[13px] border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                      {isRedeeming ? "..." : "Redeem"}
                    </button>
                  </div>
                  {redeemSuccess && <p className="m-0 text-xs text-emerald-300 font-medium">{redeemSuccess}</p>}
                  {redeemError   && <p className="m-0 text-xs text-red-300 font-medium">{redeemError}</p>}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active filter banner */}
      {filterCategory && searchParams.get("app") && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-violet-50 border border-violet-200 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-violet-800">
            <Tag size={15} className="text-violet-600" /> Showing plans for <span className="capitalize font-black">{filterCategory.replace(/-/g, " ")}</span>
          </div>
          <button onClick={() => handleFilterChange(null)} className="text-xs font-bold text-violet-600 hover:text-violet-800 border border-violet-200 rounded-full px-3 py-1 bg-white cursor-pointer">
            View all
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border-l-4 border-red-600 px-[18px] py-3.5 text-sm font-medium text-red-600">
          <AlertCircle size={18} className="shrink-0" /> {error}
        </div>
      )}

      {/* ── Bundle Plans ── */}
      {bundles.length > 0 && (
        <section>
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-gray-100">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-violet-700 to-indigo-600 flex items-center justify-center shrink-0">
              <Crown size={18} className="text-white" />
            </div>
            <div>
              <h2 className="m-0 text-xl font-black text-gray-900">Bundle Plans</h2>
              <p className="m-0 text-[13px] text-gray-500">Get multiple SaaS tools together at one low price — the smarter way to subscribe.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {bundles.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} cycle={billingCycle} redirectAfterPayment={redirectAfterPayment} />
            ))}
          </div>
        </section>
      )}

      {/* ── Individual Products ── */}
      <section ref={productsRef}>
        <FilterBar
          searchTerm={searchTerm} onSearchChange={setSearchTerm}
          categories={categories} activeCategory={filterCategory} onCategoryChange={handleFilterChange}
          productCountByCategory={productCountByCategory} totalProductCount={products.length}
        />

        {filteredProducts.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-20 px-6 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Search size={26} className="text-gray-300" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-gray-900 m-0 mb-1">
                {searchTerm ? "No matches found" : "No products available yet"}
              </h3>
              <p className="text-sm text-gray-400 m-0">Try adjusting your search or category filter.</p>
            </div>
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 cursor-pointer">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(
              filteredProducts.reduce((acc, p) => {
                const tag = p.productFamily || p.category || "Uncategorized";
                if (!acc[tag]) acc[tag] = [];
                acc[tag].push(p);
                return acc;
              }, {} as Record<string, SaaSProduct[]>)
            ).map(([tag, groupProducts]) => (
              <div key={tag} className="space-y-4">
                <div className="flex items-center gap-2.5 px-1">
                  <Tag size={17} className="text-violet-600" />
                  <h2 className="text-base font-bold text-gray-900 capitalize tracking-tight">{tag.replace(/-/g, " ")}</h2>
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">
                    {groupProducts.length} {groupProducts.length === 1 ? "plan" : "plans"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                  {groupProducts.map((product) => (
                    <ProductCard key={product.id} product={product} cycle={billingCycle} redirectAfterPayment={redirectAfterPayment} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer nudge */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="m-0 mb-0.5 font-bold text-sm text-gray-900">Already subscribed?</p>
          <p className="m-0 text-[13px] text-gray-400">Manage your active plans, renewals, and upgrades.</p>
        </div>
        <Link href="/account/subscriptions" className="inline-flex items-center gap-1.5 px-[18px] py-2.5 rounded-lg border border-violet-300 bg-white text-violet-700 text-sm font-semibold no-underline">
          Manage Subscriptions <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}