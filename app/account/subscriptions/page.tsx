"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  CreditCard, DollarSign, AlertCircle, Trash2, Loader2, Zap, ArrowUpRight,
  TrendingUp, Crown, Layers, Package, Sparkles, CheckCircle2, Calendar,
  ArrowRight, ChevronRight, BarChart3, Star, Tag, Lock,
} from "lucide-react";
import { toast } from "sonner";
import { BrandLoader } from "@/components/brand-loader";
import {
  fetchUserSubscriptions, cancelUserSubscription, fetchPublicPlans,
  fetchReferralStats, type ReferralStats,
} from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { UserSubscription } from "@/lib/api";
import { RazorpayButton } from "@/components/razorpay-checkout";
import { useAccount } from "../layout";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PublicProduct {
  id: number;
  saasProductId?: number;
  name: string;
  description: string;
  planTier?: string;
  features: string[];
  tag: string;
  productFamily: string;
  creditPoints?: number;
  usageLimits?: Record<string, any>;
  pricing?: {
    INR: { monthly: number; yearly: number };
    USD: { monthly: number; yearly: number };
  };
}

interface PublicBundle {
  id: number;
  name: string;
  description?: string;
  features: string[];
  creditPoints?: number;
  pricing: {
    INR: { monthly: number; yearly: number };
    USD: { monthly: number; yearly: number };
  };
}

type BillingCycle = "monthly" | "yearly";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(amount: number, currency: string) {
  if (!amount) return "Free";
  const val = amount / 100;
  return currency === "INR"
    ? `₹${val.toLocaleString("en-IN")}`
    : `$${val.toLocaleString("en-US")}`;
}

function formatInr(paise: number) {
  if (!paise) return "Free";
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

// ─── Billing Toggle ───────────────────────────────────────────────────────────

function BillingToggle({ cycle, onChange }: { cycle: BillingCycle; onChange: (c: BillingCycle) => void }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      {(["monthly", "yearly"] as const).map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-150
            ${cycle === opt
              ? "border-violet-700 bg-violet-700 text-white"
              : "border-gray-200 bg-transparent text-gray-500"
            }`}
        >
          {opt === "monthly" ? "Monthly" : "Yearly"}
          {opt === "yearly" && (
            <span
              className={`text-[9px] font-extrabold px-1.5 py-px rounded-full border
                ${cycle === "yearly"
                  ? "bg-white/20 text-white border-white/30"
                  : "bg-green-100 text-green-700 border-green-200"
                }`}
            >
              Save 17%
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Status Pill ──────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const cfg: Record<string, { classes: string; label: string }> = {
    active:   { classes: "bg-green-50 text-green-700 border-green-200",  label: "Active" },
    past_due: { classes: "bg-amber-50 text-amber-700 border-amber-200",  label: "Past Due" },
    canceled: { classes: "bg-red-50 text-red-600 border-red-200",        label: "Cancelled" },
    pending_cancellation: { classes: "bg-orange-50 text-orange-700 border-orange-200", label: "Cancellation Pending" },
  };
  const c = cfg[status] || cfg.active;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${c.classes}`}>
      {c.label}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

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

// ─── Tier Config ──────────────────────────────────────────────────────────────

const TIERS = ["free", "standard", "pro", "enterprise"];

const TIER_STYLE: Record<string, { bg: string; border: string; badge: string; badgeText: string }> = {
  free:       { bg: "#f9fafb", border: "#e5e7eb",  badge: "#f3f4f6", badgeText: "#374151" },
  standard:   { bg: "#faf5ff", border: "#ddd6fe",  badge: "#ede9fe", badgeText: "#6d28d9" },
  pro:        { bg: "#fff7ed", border: "#fed7aa",  badge: "#ffedd5", badgeText: "#ea580c" },
  enterprise: { bg: "#fffbeb", border: "#fde68a",  badge: "#fef3c7", badgeText: "#92400e" },
};

function TierBadge({ tier }: { tier: string }) {
  const s = TIER_STYLE[tier] || TIER_STYLE.standard;
  return (
    <span
      className="inline-flex items-center gap-[3px] text-[9px] font-extrabold uppercase tracking-wider px-[7px] py-0.5 rounded-full"
      style={{ backgroundColor: s.badge, color: s.badgeText }}
    >
      {tier === "pro" && <Crown size={8} />}
      {tier === "enterprise" && <Sparkles size={8} />}
      {tier}
    </span>
  );
}

// ─── Upgrade Modal ────────────────────────────────────────────────────────────

interface UpgradeModalProps {
  open: boolean; onClose: () => void;
  currentSub: UserSubscription; allProducts: PublicProduct[]; onSuccess: () => void;
  referralStats: ReferralStats | null;
  returnUrl?: string;
  activeSubProductIds: Set<number>;
}

function UpgradeModal({ open, onClose, currentSub, allProducts, onSuccess, referralStats, returnUrl, activeSubProductIds }: UpgradeModalProps) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [selected, setSelected] = useState<PublicProduct | null>(null);
  const [usePoints, setUsePoints] = useState(false);

  // Normalize for robust matching (strip spaces, dashes, underscores, lowercase)
  const norm = (s?: string) => s?.toLowerCase().replace(/[\s_-]+/g, "") || "";

  const currentProduct = allProducts.find(p => p.id === currentSub.saasProductId)
    // fallback: match by normalized saasId from subscription
    ?? allProducts.find(p => norm((p as any).saasId) === norm(currentSub.productSaasId));

  const currentTierIdx = TIERS.indexOf(currentProduct?.planTier || "free");

  // productFamily is the canonical grouping key — normalize both sides for robust matching
  const currentFamily = norm(currentProduct?.productFamily
    // fallback: derive family from saasId by stripping plan suffixes
    ?? currentSub.productSaasId?.replace(/[_-](free|standard|pro|enterprise|basic|starter)$/i, ""));

  // Only show plans that are:
  // 1. In the same product family (normalized)
  // 2. Strictly higher tier than current
  // 3. Not already actively subscribed to
  const display = allProducts
    .filter(p =>
      norm(p.productFamily) === currentFamily &&
      currentFamily !== "" &&
      TIERS.indexOf(p.planTier || "free") > currentTierIdx &&
      !activeSubProductIds.has(p.id)
    )
    .sort((a, b) => TIERS.indexOf(b.planTier || "free") - TIERS.indexOf(a.planTier || "free"));
  useEffect(() => {
    if (display.length > 0 && !selected) setSelected(display[0]);
  }, [display, selected]);

  // Reset selection when modal opens
  useEffect(() => {
    if (open) setSelected(null);
  }, [open]);

  const plan = selected ?? display[0];
  const currentPrice = cycle === "yearly" ? currentProduct?.pricing?.INR?.yearly : currentProduct?.pricing?.INR?.monthly;
  const upgradePrice = cycle === "yearly" ? plan?.pricing?.INR?.yearly : plan?.pricing?.INR?.monthly;
  const yearlySaving = plan?.pricing?.INR
    ? Math.max(0, (plan.pricing.INR.monthly * 12) - plan.pricing.INR.yearly)
    : 0;

  // --- Points Discount Calculation ---
  const activePoints = referralStats?.points?.active || 0;
  const pointsToCurrencyRate = 10; // 10 pts = 1 INR
  const maxDiscountPercent = 30; // 30%

  const prorationCredit = (() => {
    if (!currentSub.expiresAt || !currentSub.createdAt || !currentSub.amount) return 0;
    const now = Date.now();
    const expiry = new Date(currentSub.expiresAt).getTime();
    const start = new Date(currentSub.createdAt).getTime();
    const total = expiry - start;
    if (total <= 0) return 0;
    const remaining = expiry - now;
    if (remaining <= 0) return 0;
    const fraction = remaining / total;
    let unused = Math.floor(currentSub.amount * fraction);
    if (currentSub.currency === "USD") {
      unused = Math.round(unused * 83);
    }
    return Math.max(0, unused);
  })();

  const prorationPercent = (() => {
    if (!currentSub.expiresAt || !currentSub.createdAt) return 0;
    const expiry = new Date(currentSub.expiresAt).getTime();
    const start = new Date(currentSub.createdAt).getTime();
    const total = expiry - start;
    if (total <= 0) return 0;
    const remaining = expiry - Date.now();
    if (remaining <= 0) return 0;
    return Math.min(100, Math.round((remaining / total) * 100));
  })();

  const netBeforePoints = Math.max(0, (upgradePrice ?? 0) - prorationCredit);

  let discountedPrice = netBeforePoints;
  let pointsUsed = 0;
  let discountAmount = 0;

  if (usePoints && netBeforePoints > 0 && activePoints > 0) {
    const maxDiscountAllowed = (netBeforePoints * maxDiscountPercent) / 100;
    const pointsValueInCurrency = activePoints / pointsToCurrencyRate;
    discountAmount = Math.min(maxDiscountAllowed, pointsValueInCurrency * 100);
    pointsUsed = Math.ceil((discountAmount / 100) * pointsToCurrencyRate);
    discountedPrice = Math.max(0, netBeforePoints - discountAmount);
  }

  const currentFeats = new Set(currentProduct?.features ?? []);
  const newFeats = (plan?.features ?? []).filter(f => !currentFeats.has(f));
  const keptFeats = (plan?.features ?? []).filter(f => currentFeats.has(f));

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[720px] max-h-[88vh] overflow-hidden flex flex-col p-0">

        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0 flex-row items-center justify-between gap-3 flex-wrap space-y-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
              <TrendingUp size={16} className="text-white" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-gray-900">Change Your Plan</DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Currently on <strong>{currentSub.productName || currentSub.bundleName}</strong>
                {currentPrice ? ` · ${formatInr(currentPrice)}/${cycle === "yearly" ? "yr" : "mo"}` : ""}
              </DialogDescription>
            </div>
          </div>
          <BillingToggle cycle={cycle} onChange={setCycle} />
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {display.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center">
                <Crown size={24} className="text-violet-700" />
              </div>
              <p className="font-bold text-gray-900">You&apos;re on the highest plan</p>
              <p className="text-sm text-gray-500 max-w-[280px]">
                There are no higher plans available in this product family.
              </p>
            </div>
          ) : (
            <>
          {/* Plan selector cards */}
          <div
            className="grid gap-2.5 mb-5"
            style={{ gridTemplateColumns: display.length === 1 ? "1fr" : "repeat(auto-fill, minmax(160px, 1fr))" }}
          >
            {display.map((p) => {
              const price = cycle === "yearly" ? p.pricing?.INR?.yearly : p.pricing?.INR?.monthly;
              const ts = TIER_STYLE[p.planTier || "standard"] || TIER_STYLE.standard;
              const isSelected = selected?.id === p.id;
              const saving = p.pricing?.INR ? Math.max(0, (p.pricing.INR.monthly * 12) - p.pricing.INR.yearly) : 0;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className="relative rounded-xl p-3.5 text-left cursor-pointer transition-all duration-150 flex flex-col gap-2 border-2"
                  style={{
                    borderColor: isSelected ? "#7c3aed" : ts.border,
                    backgroundColor: isSelected ? "#faf5ff" : ts.bg,
                    boxShadow: isSelected ? "0 0 0 3px rgba(124,58,237,0.15)" : "none",
                  }}
                >
                  {isSelected && (
                    <span className="absolute top-2.5 right-2.5 text-violet-700">
                      <CheckCircle2 size={15} />
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 flex-wrap pr-5">
                    <span className="font-bold text-[13px] text-gray-900">{p.name}</span>
                    {p.planTier && <TierBadge tier={p.planTier} />}
                  </div>
                  <div>
                    <span className="text-xl font-black text-gray-900">{price ? formatInr(price) : "Free"}</span>
                    {price && price > 0 && <span className="text-[11px] text-gray-400">/{cycle === "yearly" ? "yr" : "mo"}</span>}
                  </div>
                  {p.creditPoints ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-violet-700 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-full w-fit">
                      +{p.creditPoints.toLocaleString()} points included
                    </span>
                  ) : null}
                  {cycle === "yearly" && saving > 0 && (
                    <span className="inline-flex items-center gap-[3px] text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-[7px] py-0.5 rounded-full w-fit">
                      <CheckCircle2 size={9} /> Save {formatInr(saving)}/yr
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feature Comparison Table */}
          {plan && (
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              {/* Header row */}
              <div className="grid border-b border-gray-200 bg-gray-50 sticky top-0" style={{ gridTemplateColumns: "1fr 90px 90px" }}>
                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Feature</div>
                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 border-l border-gray-200 text-center">
                  Current
                </div>
                <div className="px-3 py-2 text-[10px] font-bold text-violet-700 border-l border-gray-200 text-center">
                  New
                </div>
              </div>

              {/* NEW features */}
              {newFeats.length > 0 && (
                <>
                  <div className="px-3.5 py-[7px] bg-violet-50 border-b border-violet-100">
                    <span className="text-[10px] font-extrabold text-violet-700 uppercase tracking-wider">
                      ✨ New in {plan.name}
                    </span>
                  </div>
                  {newFeats.map((feat, i) => (
                    <div key={`new-${i}`} className="grid border-b border-gray-100 bg-[#fdfdff]" style={{ gridTemplateColumns: "1fr 90px 90px" }}>
                      <div className="px-3 py-2 text-xs text-gray-700 font-medium">{feat}</div>
                      <div className="px-3 py-2 border-l border-gray-100 flex justify-center items-center">
                        <span className="text-gray-300 text-smLeading-none">—</span>
                      </div>
                      <div className="px-3 py-2 border-l border-gray-100 flex justify-center items-center">
                        <CheckCircle2 size={14} className="text-violet-700" />
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Features in BOTH */}
              {keptFeats.length > 0 && (
                <>
                  <div className={`px-3.5 py-[7px] bg-gray-50 border-b border-gray-200 ${newFeats.length > 0 ? "border-t border-gray-200" : ""}`}>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Included in Both Plans
                    </span>
                  </div>
                  {keptFeats.map((feat, i) => (
                    <div key={`kept-${i}`} className="grid border-b border-gray-100" style={{ gridTemplateColumns: "1fr 90px 90px" }}>
                      <div className="px-3 py-2 text-xs text-gray-700 font-medium">{feat}</div>
                      <div className="px-3 py-2 border-l border-gray-100 flex justify-center items-center">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      </div>
                      <div className="px-3 py-2 border-l border-gray-100 flex justify-center items-center">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      </div>
                    </div>
                  ))}
                </>
              )}

              {plan.features.length === 0 && (
                <div className="p-7 text-center text-gray-400 text-[13px]">
                  No feature breakdown available. Admin can add features in the SaaS Products page.
                </div>
              )}
            </div>
          )}

          {/* Usage Limits */}
          {plan?.usageLimits && Object.keys(plan.usageLimits).length > 0 && (
            <div className="mt-3.5 rounded-[10px] border border-violet-200 bg-violet-50 p-3.5">
              <p className="m-0 mb-2.5 text-[11px] font-extrabold text-violet-700 uppercase tracking-wider">
                Usage Limits
              </p>
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
                {Object.entries(plan.usageLimits).map(([k, v]) => (
                  <div key={k} className="bg-white rounded-lg border border-violet-100 px-3 py-2.5">
                    <p className="m-0 mb-0.5 text-[17px] font-black text-violet-700">
                      {typeof v === "number" ? v.toLocaleString() : String(v)}
                    </p>
                    <p className="m-0 text-[11px] text-gray-500 capitalize">
                      {k.replace(/_/g, " ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Yearly savings callout */}
          {cycle === "yearly" && yearlySaving > 0 && (
            <div className="mt-3 rounded-[10px] bg-green-50 border border-green-200 px-3.5 py-2.5 flex items-center gap-2.5">
              <BarChart3 size={16} className="text-green-600 shrink-0" />
              <span className="text-[13px] text-green-700 font-semibold">
                You save {formatInr(yearlySaving)} by choosing yearly vs monthly billing
              </span>
            </div>
          )}

          {/* Points Redemption Section */}
          {upgradePrice && upgradePrice > 0 && (
            <div className={`mt-4 p-4 rounded-xl border flex flex-col gap-3 transition-colors ${
              activePoints > 0 
                ? "border-amber-200 bg-amber-50/50" 
                : "border-gray-100 bg-gray-50/50 opacity-80"
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activePoints > 0 ? "bg-amber-100 text-amber-600" : "bg-gray-200 text-gray-400"
                  }`}>
                    <Star size={16} fill="currentColor" />
                  </div>
                  <div>
                    <p className="m-0 text-sm font-bold text-gray-900">Redeem Referral Points</p>
                    <p className="m-0 text-[11px] text-gray-500">
                      {activePoints > 0 
                        ? <>You have <strong>{activePoints.toLocaleString()}</strong> active points</>
                        : "Earn points by inviting friends to get discounts"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="use-points" className={`text-xs font-bold cursor-pointer ${
                    activePoints > 0 ? "text-gray-600" : "text-gray-300"
                  }`}>Use Points</Label>
                  <Switch 
                    id="use-points" 
                    checked={usePoints} 
                    onCheckedChange={setUsePoints} 
                    disabled={activePoints <= 0}
                  />
                </div>
              </div>
              
              {usePoints && activePoints > 0 && (
                <div className="pt-2 border-t border-amber-200/50 flex items-center justify-between text-xs font-medium text-amber-800">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} /> Applying {pointsUsed.toLocaleString()} points
                  </span>
                  <span className="font-bold">-{formatInr(discountAmount)} Discount</span>
                </div>
              )}

              {activePoints <= 0 && (
                <Link href="/account/referrals" className="text-[10px] font-bold text-violet-600 hover:underline flex items-center gap-1">
                  Learn how to earn points <ArrowRight size={10} />
                </Link>
              )}
            </div>
          )}

          {/* Pricing Breakdown Card */}
          {plan && upgradePrice !== undefined && upgradePrice > 0 && (
            <div className="mt-4 p-4 rounded-xl border border-violet-100 bg-violet-50/30 flex flex-col gap-2">
              <p className="m-0 text-xs font-extrabold text-violet-700 uppercase tracking-wider">
                Price Breakdown
              </p>
              <div className="flex justify-between text-xs text-gray-600">
                <span>New Plan Price ({plan.name})</span>
                <span className="font-semibold">{formatInr(upgradePrice)}</span>
              </div>
              {prorationCredit > 0 && (
                <div className="flex justify-between text-xs text-emerald-700 font-medium">
                  <span>
                    Unused time credit ({prorationPercent}% remaining)
                  </span>
                  <span>-{formatInr(prorationCredit)}</span>
                </div>
              )}
              {usePoints && discountAmount > 0 && (
                <div className="flex justify-between text-xs text-amber-700 font-medium">
                  <span>Referral points discount</span>
                  <span>-{formatInr(discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 my-1 pt-1.5 flex justify-between text-sm font-bold text-gray-900">
                <span>Due Today</span>
                <span className="text-violet-700">{formatInr(discountedPrice)}</span>
              </div>
            </div>
          )}
            </>
          )}
        </div>

        {/* Sticky CTA footer — only shown when there are plans to upgrade to */}
        {display.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between gap-3 bg-white flex-wrap">
          <div>
            {plan && upgradePrice !== undefined && upgradePrice > 0 ? (
              <div className="flex flex-col">
                {usePoints && discountAmount > 0 && (
                  <span className="text-[10px] font-bold text-gray-400 line-through mb-[-4px]">
                    {formatInr(upgradePrice)}
                  </span>
                )}
                <div>
                  <span className="text-[22px] font-black text-violet-700">{formatInr(discountedPrice)}</span>
                  <span className="text-xs text-gray-400">/{cycle === "yearly" ? "yr" : "mo"}</span>
                </div>
              </div>
            ) : plan && upgradePrice === 0 ? (
              <span className="text-[22px] font-black text-violet-700">Free</span>
            ) : (
              <span className="text-sm text-gray-500">Select a plan above</span>
            )}
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <Button variant="ghost" size="sm" onClick={onClose}>Maybe Later</Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">All Products <ChevronRight size={13} className="ml-1" /></Link>
            </Button>
            {plan && (
              <RazorpayButton
                saasProductId={plan.id}
                billingCycle={cycle}
                currency="INR"
                planName={plan.name}
                label={TIERS.indexOf(plan.planTier || "standard") < currentTierIdx ? `Switch to ${plan.name}` : `Upgrade to ${plan.name}`}
                size="sm"
                className="h-8 text-xs gap-1.5 font-bold"
                icon={<ArrowRight size={13} />}
                usePoints={usePoints}
                upgradeFromSubscriptionId={currentSub.id}
                onSuccess={() => { onSuccess(); onClose(); }}
                returnUrl={returnUrl}
              />
            )}
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Bundle Upsell Modal ──────────────────────────────────────────────────────

interface BundleUpsellModalProps {
  open: boolean; onClose: () => void;
  userSubscriptions: UserSubscription[]; allBundles: PublicBundle[]; onSuccess: () => void;
  referralStats: ReferralStats | null;
  returnUrl?: string;
}

function BundleUpsellModal({ open, onClose, userSubscriptions, allBundles, onSuccess, referralStats, returnUrl }: BundleUpsellModalProps) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [usePoints, setUsePoints] = useState(false);
  const monthlySpend = userSubscriptions.filter(s => s.status === "active").reduce((sum, s) => {
    return sum + (s.billingCycle === "yearly" ? Math.round(s.amount / 12) : s.amount);
  }, 0);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-700 to-indigo-600 flex items-center justify-center shrink-0">
                <Crown size={16} className="text-white" />
              </div>
              Switch to a Bundle &amp; Save
            </div>
          </DialogTitle>
          <DialogDescription>
            You&apos;re spending <strong>{formatInr(monthlySpend)}/mo</strong> across individual subscriptions.
            A bundle gives you more for less.
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 flex items-center justify-between gap-4">
          <BillingToggle cycle={cycle} onChange={setCycle} />
          
          {referralStats && referralStats.points.active > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50">
              <Star size={12} className="text-amber-500" fill="currentColor" />
              <Label htmlFor="bundle-use-points" className="text-[10px] font-bold text-amber-700 cursor-pointer">Redeem Points</Label>
              <Switch id="bundle-use-points" checked={usePoints} onCheckedChange={setUsePoints} className="scale-75 origin-right" />
            </div>
          )}
        </div>

        {allBundles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center gap-3">
            <Layers size={32} className="text-gray-300" />
            <p className="text-sm text-gray-500">No bundles available yet.</p>
            <Button size="sm" asChild><Link href="/dashboard">Browse Products</Link></Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-2">
            {allBundles.map((bundle) => {
              const price = cycle === "yearly" ? bundle.pricing.INR.yearly : bundle.pricing.INR.monthly;
              const savings = monthlySpend > 0 ? Math.max(0, monthlySpend - price) : 0;
              return (
                <div key={bundle.id} className="rounded-xl border-2 border-violet-200 bg-violet-50 p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-[10px] bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0">
                        <Layers size={20} className="text-violet-700" />
                      </div>
                      <div>
                        <h4 className="m-0 font-extrabold text-[15px] text-gray-900">{bundle.name}</h4>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          <p className="m-0 text-xs text-gray-500">{bundle.features.length} products included</p>
                          {bundle.creditPoints ? (
                            <span className="inline-flex items-center text-[9px] font-extrabold text-violet-700 bg-violet-100 border border-violet-200 px-1.5 py-0.5 rounded-full">
                              +{bundle.creditPoints.toLocaleString()} points included
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="m-0 text-[22px] font-black text-gray-900">{formatInr(price)}</p>
                      <p className="m-0 text-[11px] text-gray-400">/{cycle === "yearly" ? "yr" : "mo"}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {bundle.features.slice(0, 5).map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-100 border border-violet-200 px-2 py-0.5 rounded-full">
                        <Sparkles size={9} /> {f}
                      </span>
                    ))}
                  </div>

                  {savings > 0 && (
                    <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 flex items-center gap-2 mb-3">
                      <BarChart3 size={14} className="text-green-600 shrink-0" />
                      <span className="text-xs text-green-700 font-semibold">You save {formatInr(savings)}/mo vs. your current plans</span>
                    </div>
                  )}

                  <div className="border-t border-violet-200 pt-3">
                    <RazorpayButton
                      bundleId={bundle.id} billingCycle={cycle} currency="INR" planName={bundle.name}
                      label={`Get ${bundle.name}`} fullWidth
                      className="h-[42px] text-sm font-bold w-full text-white rounded-lg bg-gradient-to-r from-violet-700 to-indigo-600 border-none"
                      icon={<Crown size={15} />}
                      usePoints={usePoints}
                      returnUrl={returnUrl}
                      onSuccess={() => { onSuccess(); onClose(); }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="ghost" size="sm" onClick={onClose}>Keep Current Plans</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Cancel Confirm Dialog ────────────────────────────────────────────────────

function CancelDialog({ open, onClose, onConfirm, loading }: {
  open: boolean; onClose: () => void; onConfirm: () => void; loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Subscription?</DialogTitle>
          <DialogDescription>
            Your access remains active until the end of the current billing period. You can resubscribe anytime.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Keep Subscription</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 size={14} className="animate-spin mr-1" />}
            Yes, Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Subscription Card ────────────────────────────────────────────────────────

function SubscriptionCard({
  sub, allProducts, allBundles,
  onUpgrade, onBundle, onCancel,
}: {
  sub: UserSubscription;
  allProducts: PublicProduct[];
  allBundles: PublicBundle[];
  onUpgrade: (sub: UserSubscription) => void;
  onBundle: () => void;
  onCancel: (id: number) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Left: icon + info */}
        <div className="flex items-start gap-3.5 flex-1 min-w-[200px]">
          <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
            {sub.bundleId
              ? <Layers size={22} className="text-violet-700" />
              : <Zap size={22} className="text-violet-700" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="font-bold text-[15px] text-gray-900">
                {sub.productName || sub.bundleName || "Plan"}
              </span>
              <StatusPill status={sub.status} />
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
              <span className="text-[13px] font-bold text-gray-900">
                {formatAmount(sub.amount, sub.currency)}/{sub.billingCycle === "yearly" ? "yr" : "mo"}
              </span>
              {sub.expiresAt && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar size={11} />
                  Renews {new Date(sub.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
            </div>
            {/* Rejection Reason Alert */}
            {(sub as any).rejectionReason && sub.status === 'active' && (
              <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-100 text-red-800 text-xs leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300">
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
          {(() => {
            const createdAtDate = new Date(sub.createdAt);
            const canCancel = (Date.now() - createdAtDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
            return canCancel ? (
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
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const { user } = useAccount();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") ?? undefined;
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [allProducts, setAllProducts] = useState<PublicProduct[]>([]);
  const [allBundles, setAllBundles] = useState<PublicBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [cancelOpen, setCancelOpen] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [upgradeModal, setUpgradeModal] = useState<UserSubscription | null>(null);
  const [bundleModal, setBundleModal] = useState(false);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [subsData, plansData, refData] = await Promise.all([
        fetchUserSubscriptions(),
        fetchPublicPlans(),
        fetchReferralStats().catch(() => null)
      ]);
      setSubscriptions(Array.isArray(subsData) ? subsData : ((subsData as any)?.subscriptions || []));
      setAllProducts((plansData.products as any[]) || []);
      setAllBundles((plansData.bundles as any[]) || []);
      setReferralStats(refData);
    } catch (err: any) {
      setError(err.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCancel = async (id: number) => {
    setCancelling(id);
    try {
      await cancelUserSubscription(id);
      // Instead of removing, we update the status to pending
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: 'pending_cancellation' as any } : s));
      toast.success("Cancellation request submitted for admin approval");
      setCancelOpen(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel");
    } finally {
      setCancelling(null);
    }
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === "active" || s.status === "pending_cancellation");
  const inactiveSubscriptions = subscriptions.filter(s => s.status !== "active" && s.status !== "pending_cancellation");

  const totalMonthlySpend = activeSubscriptions.reduce((sum, s) => {
    return sum + (s.billingCycle === "yearly" ? Math.round(s.amount / 12) : s.amount);
  }, 0);

  const nextRenewal = activeSubscriptions
    .filter(s => s.expiresAt)
    .sort((a, b) => new Date(a.expiresAt!).getTime() - new Date(b.expiresAt!).getTime())[0];

  if (loading) {
    return <BrandLoader size="md" text="Syncing billing and plans..." />;
  }

  return (
    <div className="flex flex-col gap-6 pb-12">

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Active Plans" value={String(activeSubscriptions.length)} iconBg="#dcfce7" iconColor="#16a34a" icon={<CreditCard size={17} />} />
        <StatCard label="Monthly Spend" value={formatAmount(totalMonthlySpend, "INR")} iconBg="#ede9fe" iconColor="#7c3aed" icon={<DollarSign size={17} />} />
        <StatCard
          label="Next Renewal"
          value={nextRenewal?.expiresAt ? new Date(nextRenewal.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
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
          {/* Decorative crown */}
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

          {Object.entries(
            activeSubscriptions.reduce((acc, sub) => {
              // Group by normalized productFamily
              const norm = (s?: string) => s?.toLowerCase().replace(/[\s_-]+/g, "") || "";
              const product = allProducts.find(p => p.id === sub.saasProductId)
                ?? allProducts.find(p => norm((p as any).saasId) === norm(sub.productSaasId));
              const family = norm(product?.productFamily)
                || norm(sub.productSaasId?.replace(/[_-](free|standard|pro|enterprise|basic|starter)$/i, ""))
                || sub.productName || "Other Apps";
              const label = product?.tag || sub.productName || family;
              if (!acc[family]) acc[family] = { label, subs: [] as UserSubscription[] };
              acc[family].subs.push(sub);
              return acc;
            }, {} as Record<string, { label: string; subs: UserSubscription[] }>)
          ).map(([family, { label, subs: groupSubs }]) => (
            <div key={family} className="space-y-4">
              <div className="flex items-center gap-2.5 px-1 mt-2">
                <Tag size={17} className="text-violet-600" />
                <h2 className="text-base font-bold text-gray-900 capitalize tracking-tight">
                  {label.replace(/-/g, " ")}
                </h2>
                <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">
                  {groupSubs.length} {groupSubs.length === 1 ? 'plan' : 'plans'}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {groupSubs.map(sub => (
                  <SubscriptionCard
                    key={sub.id}
                    sub={sub}
                    allProducts={allProducts}
                    allBundles={allBundles}
                    onUpgrade={setUpgradeModal}
                    onBundle={() => setBundleModal(true)}
                    onCancel={setCancelOpen}
                  />
                ))}
              </div>
            </div>
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
              <Package size={15} /> Browse Products
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
            {inactiveSubscriptions.map(sub => (
              <div
                key={sub.id}
                className="rounded-[10px] border border-gray-200 bg-gray-50 px-[18px] py-3.5 flex items-center justify-between gap-3 opacity-65"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Zap size={15} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="m-0 mb-0.5 text-sm font-semibold text-gray-700">{sub.productName || sub.bundleName || "Plan"}</p>
                    <p className="m-0 text-xs text-gray-400 capitalize">
                      {sub.status} · {sub.billingCycle} · {formatAmount(sub.amount, sub.currency)}
                      {sub.canceledAt && ` · Cancelled ${new Date(sub.canceledAt).toLocaleDateString()}`}
                      {(sub as any).refundId && ` · Refunded (${(sub as any).refundId})`}
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 text-xs font-semibold text-gray-700 no-underline bg-white shrink-0"
                >
                  Resubscribe
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {upgradeModal && (
        <UpgradeModal
          open={!!upgradeModal} onClose={() => setUpgradeModal(null)}
          currentSub={upgradeModal}
          allProducts={allProducts as PublicProduct[]}
          referralStats={referralStats}
          returnUrl={returnUrl}
          activeSubProductIds={new Set(activeSubscriptions.map(s => s.saasProductId).filter(Boolean) as number[])}
          onSuccess={loadData}
        />
      )}

      <BundleUpsellModal
        open={bundleModal} onClose={() => setBundleModal(false)}
        userSubscriptions={subscriptions}
        allBundles={allBundles as PublicBundle[]}
        referralStats={referralStats}
        returnUrl={returnUrl}
        onSuccess={loadData}
      />

      <CancelDialog
        open={!!cancelOpen} onClose={() => setCancelOpen(null)}
        onConfirm={() => cancelOpen !== null && handleCancel(cancelOpen)}
        loading={cancelling === cancelOpen}
      />
    </div>
  );
}