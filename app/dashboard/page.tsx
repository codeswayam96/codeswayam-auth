"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Loader2, AlertCircle, Package, Search, Layers, Zap,
  Star, TrendingDown, Crown, Sparkles, ArrowRight,
  CheckCircle2, ChevronRight, Tag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { fetchPublicPlans, redeemCouponCode } from "@/lib/api";
import { RazorpayButton } from "@/components/razorpay-checkout";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SaaSProduct {
  id: string;
  saasId: string;
  productFamily: string;
  name: string;
  description: string;
  category: string;
  monthlyInr: number;
  yearlyInr: number;
  monthlyUsd: number;
  yearlyUsd: number;
  status: "active" | "beta" | "coming_soon";
  planTier?: string;
  isFreeTier?: boolean;
  features: string[];
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  monthlyInr: number;
  yearlyInr: number;
  monthlyUsd: number;
  yearlyUsd: number;
  features: string[];
}

type BillingCycle = "monthly" | "yearly";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatInr(paise: number): string {
  if (paise === 0) return "Free";
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function yearlySaving(monthly: number, yearly: number): number {
  return Math.max(0, monthly * 12 - yearly);
}

function yearlySavingPct(monthly: number, yearly: number): number {
  if (!monthly) return 0;
  return Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100);
}

// ─── Billing Toggle ───────────────────────────────────────────────────────────

function BillingToggle({ cycle, onChange }: { cycle: BillingCycle; onChange: (c: BillingCycle) => void }) {
  return (
    <div className="inline-flex items-center rounded-full border border-white/25 bg-white/10 p-1 gap-1 w-full sm:w-auto">
      {(["monthly", "yearly"] as const).map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold border-none cursor-pointer transition-all duration-200
            ${cycle === opt
              ? "bg-white text-violet-700 shadow-sm"
              : "bg-transparent text-white/75"
            }`}
        >
          {opt === "monthly" ? "Monthly" : "Yearly"}
          {opt === "yearly" && (
            <span
              className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full
                ${cycle === "yearly"
                  ? "bg-violet-100 text-violet-700"
                  : "bg-emerald-400/25 text-emerald-100"
                }`}
            >
              -17%
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    active: "bg-green-50 text-green-700 border border-green-200",
    beta: "bg-blue-50 text-blue-700 border border-blue-200",
    coming_soon: "bg-amber-50 text-amber-700 border border-amber-200",
  };
  const labels: Record<string, string> = {
    active: "Active",
    beta: "Beta",
    coming_soon: "Coming Soon",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${cfg[status] || cfg.active}`}>
      {labels[status] || "Active"}
    </span>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, cycle, redirectAfterPayment }: { product: SaaSProduct; cycle: BillingCycle; redirectAfterPayment: string }) {
  const price = cycle === "yearly" ? product.yearlyInr : product.monthlyInr;
  const isComingSoon = product.status === "coming_soon";
  const isFree = price === 0;
  const saving = yearlySaving(product.monthlyInr, product.yearlyInr);
  const savePct = yearlySavingPct(product.monthlyInr, product.yearlyInr);

  return (
    <div
      className={`flex flex-col h-full rounded-xl border border-gray-200 bg-white overflow-hidden transition-all duration-200
        hover:shadow-[0_8px_30px_rgba(109,40,217,0.12)] hover:-translate-y-0.5 hover:border-violet-300
        ${isComingSoon ? "opacity-60 pointer-events-none" : ""}`}
    >
      {/* Accent bar */}
      <div className="h-[3px] bg-gradient-to-r from-violet-500 to-indigo-500 shrink-0" />

      <div className="p-5 flex flex-col flex-1">
        {/* Category + Status */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{product.category}</span>
          <StatusBadge status={product.status} />
        </div>

        {/* Icon + Name */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-700 shrink-0">
            <Package size={22} />
          </div>
          <div className="min-w-0 pt-0.5">
            <h3 className="font-bold text-[17px] leading-tight text-gray-900 m-0 truncate">{product.name}</h3>
            {product.planTier && (
              <span className="text-[11px] font-semibold text-violet-700 block mt-0.5 capitalize">{product.planTier} tier</span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-[13px] text-gray-500 leading-relaxed mb-4 line-clamp-2">
          {product.description || "Powerful SaaS tool for your workflow."}
        </p>

        {/* Features */}
        {product.features.length > 0 && (
          <ul className="list-none p-0 m-0 mb-4 flex flex-col gap-1.5 flex-1">
            {product.features.slice(0, 4).map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-gray-700">
                <CheckCircle2 size={14} className="text-violet-700 shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
            {product.features.length > 4 && (
              <li className="text-xs text-violet-700 font-semibold pl-[22px]">
                +{product.features.length - 4} more features
              </li>
            )}
          </ul>
        )}

        {/* Price + CTA */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-[26px] font-black text-gray-900 tracking-tight">{formatInr(price)}</span>
              {price > 0 && (
                <span className="text-[13px] text-gray-400">/{cycle === "yearly" ? "yr" : "mo"}</span>
              )}
            </div>
            <div className="h-5 mt-1">
              {cycle === "monthly" && saving > 0 && (
                <span className="text-xs text-emerald-600 font-semibold">Save {formatInr(saving)}/yr on annual</span>
              )}
              {cycle === "yearly" && savePct > 0 && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                  <TrendingDown size={11} /> {savePct}% off vs monthly
                </span>
              )}
            </div>
          </div>

          {isFree ? (
            <Link
              href="/account/subscriptions"
              className="flex items-center justify-center gap-1 w-full h-10 rounded-lg bg-violet-700 text-white text-sm font-semibold no-underline"
            >
              Start for Free <ChevronRight size={15} />
            </Link>
          ) : isComingSoon ? (
            <button
              disabled
              className="w-full h-10 rounded-lg bg-gray-100 text-gray-400 text-sm font-semibold border-none cursor-not-allowed"
            >
              Coming Soon
            </button>
          ) : (
            <RazorpayButton
              saasProductId={Number(product.id)}
              billingCycle={cycle}
              currency="INR"
              planName={product.name}
              label={cycle === "yearly" ? "Get Annual Plan" : "Subscribe Now"}
              fullWidth
              size="default"
              className="w-full font-semibold rounded-lg h-10"
              returnUrl={redirectAfterPayment}
              onSuccess={() => (window.location.href = redirectAfterPayment)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Bundle Card ──────────────────────────────────────────────────────────────

function BundleCard({ bundle, cycle, redirectAfterPayment }: { bundle: Bundle; cycle: BillingCycle; redirectAfterPayment: string }) {
  const price = cycle === "yearly" ? bundle.yearlyInr : bundle.monthlyInr;
  const saving = yearlySaving(bundle.monthlyInr, bundle.yearlyInr);
  const savePct = yearlySavingPct(bundle.monthlyInr, bundle.yearlyInr);
  const includedCount = Math.max(bundle.features.length, 2);

  return (
    <div className="flex flex-col h-full rounded-[14px] border-2 border-violet-300 bg-violet-50 overflow-hidden relative transition-all duration-200 hover:shadow-[0_12px_40px_rgba(109,40,217,0.18)] hover:-translate-y-0.5">
      {/* Best Value ribbon */}
      <div className="absolute top-0 right-0 bg-gradient-to-r from-violet-700 to-indigo-600 text-white text-[10px] font-extrabold px-3.5 py-1.5 rounded-bl-[10px] flex items-center gap-1.5 uppercase tracking-wider z-10">
        <Crown size={11} /> Best Value
      </div>

      <div className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4 sm:pr-32">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[14px] bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 shrink-0">
            <Layers size={26} />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-lg sm:text-xl leading-tight text-gray-900 m-0 mb-1 truncate">{bundle.name}</h3>
            <span className="text-[10px] sm:text-xs font-bold bg-violet-100 text-violet-700 px-2 sm:px-2.5 py-0.5 rounded-md border border-violet-200 inline-block whitespace-nowrap">
              {includedCount} Pro Apps Included
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed mb-5">
          {bundle.description || "The ultimate toolkit. Access our premium creative and productivity suite at a single low price."}
        </p>

        {/* What's included */}
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider m-0 mb-2.5">What's Included</p>

        <ul className="list-none p-0 m-0 mb-6 flex flex-col gap-2 flex-1">
          {bundle.features.slice(0, 5).map((f, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm font-medium text-gray-800">
              <div className="w-[22px] h-[22px] rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0">
                <Sparkles size={11} className="text-violet-700" />
              </div>
              {f}
            </li>
          ))}
          {bundle.features.length > 5 && (
            <li className="text-xs font-bold text-violet-700 pl-8">+ {bundle.features.length - 5} more integrated apps</li>
          )}
        </ul>

        {/* Price + CTA */}
        <div className="mt-auto pt-5 border-t border-violet-200">
          <div className="h-7 mb-3">
            {cycle === "monthly" && saving > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-md">
                <Star size={11} className="text-green-600" /> Switch to yearly and save {formatInr(saving)}/year
              </span>
            )}
            {cycle === "yearly" && savePct > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-md">
                <TrendingDown size={11} className="text-green-600" /> {savePct}% bundle discount applied
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-[32px] font-black text-gray-900 tracking-tight">{formatInr(price)}</span>
            {price > 0 && (
              <span className="text-sm text-gray-400 font-medium">/{cycle === "yearly" ? "yr" : "mo"}</span>
            )}
          </div>
          {price > 0 && (
            <p className="text-xs text-gray-400 m-0 mb-4">For all {includedCount} applications</p>
          )}

          <RazorpayButton
            bundleId={Number(bundle.id)}
            billingCycle={cycle}
            currency="INR"
            planName={bundle.name}
            label={`Unlock All ${includedCount} Apps Now`}
            fullWidth
            size="lg"
            className="w-full font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20 rounded-[10px] h-[52px] text-base cursor-pointer flex items-center justify-center gap-2"
            icon={<Crown size={16} />}
            returnUrl={redirectAfterPayment}
            onSuccess={() => (window.location.href = redirectAfterPayment)}
          />
          <p className="text-center text-xs text-gray-400 mt-2">Instant access · Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productsRef = useRef<HTMLElement>(null);

  const [products, setProducts] = useState<SaaSProduct[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(
    searchParams.get("app") ?? null
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [couponCode, setCouponCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  // The URL to redirect to after a successful payment (cross-domain support)
  const redirectAfterPayment = searchParams.get("redirect") ?? "/account/subscriptions";

  // Sync filterCategory → URL
  const handleFilterChange = (cat: string | null) => {
    setFilterCategory(cat);
    const params = new URLSearchParams(searchParams.toString());
    if (cat) {
      params.set("app", cat);
    } else {
      params.delete("app");
    }
    router.replace(`/dashboard?${params.toString()}`, { scroll: false });
    // Scroll to products section
    setTimeout(() => productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  // On mount: if ?app= is set, scroll to products section
  useEffect(() => {
    if (searchParams.get("app")) {
      setTimeout(() => productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    }
  }, [loading]); // run after products load

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    setIsRedeeming(true);
    setRedeemError(null);
    setRedeemSuccess(null);
    try {
      const res = await redeemCouponCode(couponCode);
      if (res.success) {
        setRedeemSuccess(`Success! Awarded ${res.pointsAwarded} points.`);
        setCouponCode("");
      } else {
        setRedeemError(res.message);
      }
    } catch (err: any) {
      setRedeemError(err.message || "Failed to redeem code");
    } finally {
      setIsRedeeming(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPublicPlans();
        const mappedProducts: SaaSProduct[] = (data.products || []).map((p: any) => ({
          id: p.id.toString(), saasId: p.saasId,
          productFamily: p.productFamily || p.saasId,
          name: p.name,
          description: p.description || "Powerful SaaS product",
          category: p.tag || "Productivity",
          monthlyInr: p.pricing?.INR?.monthly ?? p.monthlyPriceInr ?? 0,
          yearlyInr: p.pricing?.INR?.yearly ?? p.yearlyPriceInr ?? 0,
          monthlyUsd: p.pricing?.USD?.monthly ?? p.monthlyPriceUsd ?? 0,
          yearlyUsd: p.pricing?.USD?.yearly ?? p.yearlyPriceUsd ?? 0,
          status: p.status || "active", planTier: p.planTier || "standard",
          isFreeTier: Boolean(p.isFreeTier),
          features: Array.isArray(p.features) ? p.features : [],
        }));
        const mappedBundles: Bundle[] = (data.bundles || []).map((b: any) => ({
          id: b.id.toString(), name: b.name, description: b.description || "",
          monthlyInr: b.pricing?.INR?.monthly ?? (b.price ? b.price * 100 : 0),
          yearlyInr: b.pricing?.INR?.yearly ?? 0,
          monthlyUsd: b.pricing?.USD?.monthly ?? 0,
          yearlyUsd: b.pricing?.USD?.yearly ?? 0,
          features: Array.isArray(b.features) ? b.features : ["All included products", "Priority support", "Bundle discount"],
        }));
        setProducts(mappedProducts);
        setBundles(mappedBundles);
      } catch (err: any) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || p.productFamily === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map((p) => p.productFamily)));

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
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/[0.06]" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/[0.06]" />
        </div>

        <div className="relative z-10 px-5 sm:px-10 py-7 sm:py-9">
          {/* Label */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold uppercase tracking-widest text-white/90 mb-4">
            <Sparkles size={12} /> SaaS Marketplace
          </div>

          {/* Two-column layout */}
          <div className="flex flex-wrap items-start justify-between gap-8">
            {/* Copy */}
            <div className="flex-1 min-w-full sm:min-w-[300px]">
              <h1 className="text-[clamp(22px,3.5vw,34px)] font-black leading-tight m-0 mb-2.5 text-white">
                The Tools Your Business Deserves
              </h1>
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

            {/* Right: Actions */}
            <div className="shrink-0 flex flex-col gap-4 w-full sm:w-auto sm:min-w-[260px]">
              {/* Billing toggle box */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-[14px] p-5 flex flex-col gap-3">
                <p className="m-0 text-[11px] font-bold text-white/70 uppercase tracking-wider">Billing Cycle</p>
                <BillingToggle cycle={billingCycle} onChange={setBillingCycle} />
                <div className="border-t border-white/15 pt-3 flex gap-2">
                  <Link
                    href="/account/subscriptions"
                    className="flex-1 flex items-center justify-center py-2 rounded-lg bg-white/10 border border-white/15 text-white/85 text-[13px] font-semibold no-underline"
                  >
                    Subscriptions
                  </Link>
                  <Link
                    href="/account/credits"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white text-violet-700 text-[13px] font-bold no-underline"
                  >
                    <Zap size={14} /> Buy Points
                  </Link>
                </div>
              </div>

              {/* Redeem Coupon Box */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-[14px] p-4">
                <p className="m-0 mb-2 text-[11px] font-bold text-white/70 uppercase tracking-wider">Redeem Code</p>
                <form onSubmit={handleRedeem} className="flex flex-col gap-2">
                  <div className="flex gap-1.5">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 rounded-md border border-white/30 bg-black/10 text-white text-[13px] outline-none placeholder:text-white/50"
                    />
                    <button
                      disabled={isRedeeming || !couponCode}
                      className="px-3.5 py-2 rounded-md bg-emerald-400 text-emerald-950 font-bold text-[13px] border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isRedeeming ? "..." : "Redeem"}
                    </button>
                  </div>
                  {redeemSuccess && (
                    <p className="m-0 text-xs text-emerald-300 font-medium">{redeemSuccess}</p>
                  )}
                  {redeemError && (
                    <p className="m-0 text-xs text-red-300 font-medium">{redeemError}</p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active filter banner — shown when redirected from another app */}
      {filterCategory && searchParams.get("app") && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-violet-50 border border-violet-200 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-violet-800">
            <Tag size={15} className="text-violet-600" />
            Showing plans for <span className="capitalize font-black">{filterCategory.replace(/-/g, " ")}</span>
          </div>
          <button
            onClick={() => handleFilterChange(null)}
            className="text-xs font-bold text-violet-600 hover:text-violet-800 border border-violet-200 rounded-full px-3 py-1 bg-white cursor-pointer"
          >
            View all
          </button>
        </div>
      )}

      {/* Error */}
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
        {/* Header + search */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
              <Package size={18} className="text-violet-700" />
            </div>
            <div>
              <h2 className="m-0 text-xl font-black text-gray-900">Individual Products</h2>
              <p className="m-0 text-[13px] text-gray-500">Subscribe only to what you need, one tool at a time.</p>
            </div>
          </div>
          <div className="relative w-full sm:w-60 shrink-0">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 sm:h-9 text-sm rounded-xl border-gray-200 focus-visible:ring-violet-400 focus-visible:ring-offset-0 bg-white"
            />
          </div>
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {[null, ...categories].map((cat) => {
              const active = filterCategory === cat;
              const label =
                cat === null
                  ? `All (${products.length})`
                  : `${cat} (${products.filter((p) => p.productFamily === cat).length})`;
              return (
                <button
                  key={cat ?? "__all__"}
                  onClick={() => handleFilterChange(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold border cursor-pointer transition-all duration-150 capitalize
                    ${active
                      ? "border-violet-700 bg-violet-700 text-white"
                      : "border-gray-200 bg-transparent text-gray-500 hover:border-violet-300 hover:text-violet-700"
                    }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Grouped Grid */}
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
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 cursor-pointer"
              >
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
                  <h2 className="text-base font-bold text-gray-900 capitalize tracking-tight">
                    {tag.replace(/-/g, " ")}
                  </h2>
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">
                    {groupProducts.length} {groupProducts.length === 1 ? 'plan' : 'plans'}
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

      {/* ── Footer nudge ── */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="m-0 mb-0.5 font-bold text-sm text-gray-900">Already subscribed?</p>
          <p className="m-0 text-[13px] text-gray-400">Manage your active plans, renewals, and upgrades.</p>
        </div>
        <Link
          href="/account/subscriptions"
          className="inline-flex items-center gap-1.5 px-[18px] py-2.5 rounded-lg border border-violet-300 bg-white text-violet-700 text-sm font-semibold no-underline"
        >
          Manage Subscriptions <ArrowRight size={14} />
        </Link>
      </div>

    </div>
  );
}