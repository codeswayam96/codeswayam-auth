"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  TrendingUp, Crown, CheckCircle2, BarChart3,
  Star, ArrowRight, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import type { UserSubscription } from "@/lib/api";
import type { PublicProduct, BillingCycle } from "@/types";
import { formatInr, PLAN_TIERS, normalizeKey } from "@/types";
import { RazorpayButton } from "@/components/razorpay-checkout";
import type { ReferralStats } from "@/lib/api";
import { BillingToggle } from "./BillingToggle";
import { TierBadge } from "./TierBadge";

const TIER_STYLES: Record<string, { bg: string; border: string }> = {
  free:       { bg: "#f9fafb", border: "#e5e7eb" },
  standard:   { bg: "#faf5ff", border: "#ddd6fe" },
  pro:        { bg: "#fff7ed", border: "#fed7aa" },
  enterprise: { bg: "#fffbeb", border: "#fde68a" },
};

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  currentSub: UserSubscription;
  allProducts: PublicProduct[];
  onSuccess: () => void;
  referralStats: ReferralStats | null;
  returnUrl?: string;
  activeSubProductIds: Set<number>;
}

/**
 * UpgradeModal — plan selector with feature comparison, proration credit,
 * and optional referral-points redemption.
 */
export function UpgradeModal({
  open, onClose, currentSub, allProducts, onSuccess,
  referralStats, returnUrl, activeSubProductIds,
}: UpgradeModalProps) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [selected, setSelected] = useState<PublicProduct | null>(null);
  const [usePoints, setUsePoints] = useState(false);

  const currentProduct = allProducts.find((p) => p.id === currentSub.saasProductId)
    ?? allProducts.find((p) => normalizeKey((p as any).saasId) === normalizeKey(currentSub.productSaasId));

  const currentTierIdx = PLAN_TIERS.indexOf((currentProduct?.planTier as any) ?? "free");
  const currentFamily = normalizeKey(
    currentProduct?.productFamily
    ?? currentSub.productSaasId?.replace(/[_-](free|standard|pro|enterprise|basic|starter)$/i, "")
  );

  const upgradablePlans = allProducts
    .filter((p) =>
      normalizeKey(p.productFamily) === currentFamily &&
      currentFamily !== "" &&
      PLAN_TIERS.indexOf((p.planTier as any) ?? "free") > currentTierIdx &&
      !activeSubProductIds.has(p.id)
    )
    .sort((a, b) =>
      PLAN_TIERS.indexOf((b.planTier as any) ?? "free") - PLAN_TIERS.indexOf((a.planTier as any) ?? "free")
    );

  useEffect(() => {
    if (upgradablePlans.length > 0 && !selected) setSelected(upgradablePlans[0]);
  }, [upgradablePlans, selected]);

  useEffect(() => {
    if (open) setSelected(null);
  }, [open]);

  const plan = selected ?? upgradablePlans[0];
  const currentPrice = cycle === "yearly" ? currentProduct?.pricing?.INR?.yearly : currentProduct?.pricing?.INR?.monthly;
  const upgradePrice = cycle === "yearly" ? plan?.pricing?.INR?.yearly : plan?.pricing?.INR?.monthly;
  const yearlySaving = plan?.pricing?.INR
    ? Math.max(0, plan.pricing.INR.monthly * 12 - plan.pricing.INR.yearly)
    : 0;

  // Proration credit calculation
  const prorationCredit = (() => {
    if (!currentSub.expiresAt || !currentSub.createdAt || !currentSub.amount) return 0;
    const now = Date.now();
    const expiry = new Date(currentSub.expiresAt).getTime();
    const start = new Date(currentSub.createdAt).getTime();
    const total = expiry - start;
    if (total <= 0) return 0;
    const remaining = expiry - now;
    if (remaining <= 0) return 0;
    let unused = Math.floor(currentSub.amount * (remaining / total));
    if (currentSub.currency === "USD") unused = Math.round(unused * 83);
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

  const activePoints = referralStats?.points?.active ?? 0;
  const netBeforePoints = Math.max(0, (upgradePrice ?? 0) - prorationCredit);
  let discountedPrice = netBeforePoints;
  let pointsUsed = 0;
  let discountAmount = 0;

  if (usePoints && netBeforePoints > 0 && activePoints > 0) {
    const maxDiscountAllowed = (netBeforePoints * 30) / 100;
    const pointsValueInCurrency = activePoints / 10;
    discountAmount = Math.min(maxDiscountAllowed, pointsValueInCurrency * 100);
    pointsUsed = Math.ceil((discountAmount / 100) * 10);
    discountedPrice = Math.max(0, netBeforePoints - discountAmount);
  }

  const currentFeats = new Set(currentProduct?.features ?? []);
  const newFeats = (plan?.features ?? []).filter((f) => !currentFeats.has(f));
  const keptFeats = (plan?.features ?? []).filter((f) => currentFeats.has(f));

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
          {upgradablePlans.length === 0 ? (
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
                style={{ gridTemplateColumns: upgradablePlans.length === 1 ? "1fr" : "repeat(auto-fill, minmax(160px, 1fr))" }}
              >
                {upgradablePlans.map((p) => {
                  const price = cycle === "yearly" ? p.pricing?.INR?.yearly : p.pricing?.INR?.monthly;
                  const ts = TIER_STYLES[p.planTier ?? "standard"] ?? TIER_STYLES.standard;
                  const isSelected = selected?.id === p.id;
                  const saving = p.pricing?.INR
                    ? Math.max(0, p.pricing.INR.monthly * 12 - p.pricing.INR.yearly)
                    : 0;
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
                      {p.creditPoints && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-violet-700 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-full w-fit">
                          +{p.creditPoints.toLocaleString()} points included
                        </span>
                      )}
                      {cycle === "yearly" && saving > 0 && (
                        <span className="inline-flex items-center gap-[3px] text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-[7px] py-0.5 rounded-full w-fit">
                          <CheckCircle2 size={9} /> Save {formatInr(saving)}/yr
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feature Comparison */}
              {plan && (
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="grid border-b border-gray-200 bg-gray-50 sticky top-0" style={{ gridTemplateColumns: "1fr 90px 90px" }}>
                    <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Feature</div>
                    <div className="px-3 py-2 text-[10px] font-bold text-gray-400 border-l border-gray-200 text-center">Current</div>
                    <div className="px-3 py-2 text-[10px] font-bold text-violet-700 border-l border-gray-200 text-center">New</div>
                  </div>
                  {newFeats.length > 0 && (
                    <>
                      <div className="px-3.5 py-[7px] bg-violet-50 border-b border-violet-100">
                        <span className="text-[10px] font-extrabold text-violet-700 uppercase tracking-wider">✨ New in {plan.name}</span>
                      </div>
                      {newFeats.map((feat, i) => (
                        <div key={`new-${i}`} className="grid border-b border-gray-100 bg-[#fdfdff]" style={{ gridTemplateColumns: "1fr 90px 90px" }}>
                          <div className="px-3 py-2 text-xs text-gray-700 font-medium">{feat}</div>
                          <div className="px-3 py-2 border-l border-gray-100 flex justify-center items-center"><span className="text-gray-300">—</span></div>
                          <div className="px-3 py-2 border-l border-gray-100 flex justify-center items-center"><CheckCircle2 size={14} className="text-violet-700" /></div>
                        </div>
                      ))}
                    </>
                  )}
                  {keptFeats.length > 0 && (
                    <>
                      <div className={`px-3.5 py-[7px] bg-gray-50 border-b border-gray-200 ${newFeats.length > 0 ? "border-t border-gray-200" : ""}`}>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Included in Both Plans</span>
                      </div>
                      {keptFeats.map((feat, i) => (
                        <div key={`kept-${i}`} className="grid border-b border-gray-100" style={{ gridTemplateColumns: "1fr 90px 90px" }}>
                          <div className="px-3 py-2 text-xs text-gray-700 font-medium">{feat}</div>
                          <div className="px-3 py-2 border-l border-gray-100 flex justify-center items-center"><CheckCircle2 size={14} className="text-emerald-500" /></div>
                          <div className="px-3 py-2 border-l border-gray-100 flex justify-center items-center"><CheckCircle2 size={14} className="text-emerald-500" /></div>
                        </div>
                      ))}
                    </>
                  )}
                  {plan.features.length === 0 && (
                    <div className="p-7 text-center text-gray-400 text-[13px]">
                      No feature breakdown available.
                    </div>
                  )}
                </div>
              )}

              {/* Usage Limits */}
              {plan?.usageLimits && Object.keys(plan.usageLimits).length > 0 && (
                <div className="mt-3.5 rounded-[10px] border border-violet-200 bg-violet-50 p-3.5">
                  <p className="m-0 mb-2.5 text-[11px] font-extrabold text-violet-700 uppercase tracking-wider">Usage Limits</p>
                  <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
                    {Object.entries(plan.usageLimits).map(([k, v]) => (
                      <div key={k} className="bg-white rounded-lg border border-violet-100 px-3 py-2.5">
                        <p className="m-0 mb-0.5 text-[17px] font-black text-violet-700">
                          {typeof v === "number" ? v.toLocaleString() : String(v)}
                        </p>
                        <p className="m-0 text-[11px] text-gray-500 capitalize">{k.replace(/_/g, " ")}</p>
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

              {/* Points Redemption */}
              {upgradePrice && upgradePrice > 0 && (
                <div className={`mt-4 p-4 rounded-xl border flex flex-col gap-3 transition-colors ${activePoints > 0 ? "border-amber-200 bg-amber-50/50" : "border-gray-100 bg-gray-50/50 opacity-80"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activePoints > 0 ? "bg-amber-100 text-amber-600" : "bg-gray-200 text-gray-400"}`}>
                        <Star size={16} fill="currentColor" />
                      </div>
                      <div>
                        <p className="m-0 text-sm font-bold text-gray-900">Redeem Referral Points</p>
                        <p className="m-0 text-[11px] text-gray-500">
                          {activePoints > 0
                            ? <><strong>{activePoints.toLocaleString()}</strong> active points available</>
                            : "Earn points by inviting friends to get discounts"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="use-points" className={`text-xs font-bold cursor-pointer ${activePoints > 0 ? "text-gray-600" : "text-gray-300"}`}>Use Points</Label>
                      <Switch id="use-points" checked={usePoints} onCheckedChange={setUsePoints} disabled={activePoints <= 0} />
                    </div>
                  </div>
                  {usePoints && activePoints > 0 && (
                    <div className="pt-2 border-t border-amber-200/50 flex items-center justify-between text-xs font-medium text-amber-800">
                      <span className="flex items-center gap-1.5"><CheckCircle2 size={13} /> Applying {pointsUsed.toLocaleString()} points</span>
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

              {/* Price Breakdown */}
              {plan && upgradePrice !== undefined && upgradePrice > 0 && (
                <div className="mt-4 p-4 rounded-xl border border-violet-100 bg-violet-50/30 flex flex-col gap-2">
                  <p className="m-0 text-xs font-extrabold text-violet-700 uppercase tracking-wider">Price Breakdown</p>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>New Plan Price ({plan.name})</span>
                    <span className="font-semibold">{formatInr(upgradePrice)}</span>
                  </div>
                  {prorationCredit > 0 && (
                    <div className="flex justify-between text-xs text-emerald-700 font-medium">
                      <span>Unused time credit ({prorationPercent}% remaining)</span>
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

        {/* Sticky CTA footer */}
        {upgradablePlans.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between gap-3 bg-white flex-wrap">
            <div>
              {plan && upgradePrice !== undefined && upgradePrice > 0 ? (
                <div className="flex flex-col">
                  {usePoints && discountAmount > 0 && (
                    <span className="text-[10px] font-bold text-gray-400 line-through mb-[-4px]">{formatInr(upgradePrice)}</span>
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
                  label={
                    PLAN_TIERS.indexOf((plan.planTier as any) ?? "standard") < currentTierIdx
                      ? `Switch to ${plan.name}`
                      : `Upgrade to ${plan.name}`
                  }
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
