"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Crown, Layers, BarChart3, Sparkles } from "lucide-react";
import Link from "next/link";
import type { UserSubscription } from "@/lib/api";
import type { PublicBundle, BillingCycle } from "@/types";
import { formatInr } from "@/types";
import { RazorpayButton } from "@/components/razorpay-checkout";
import type { ReferralStats } from "@/lib/api";
import { BillingToggle } from "./BillingToggle";

interface BundleUpsellModalProps {
  open: boolean;
  onClose: () => void;
  userSubscriptions: UserSubscription[];
  allBundles: PublicBundle[];
  onSuccess: () => void;
  referralStats: ReferralStats | null;
  returnUrl?: string;
}

/**
 * BundleUpsellModal — shows available bundles with savings comparison vs individual plans.
 */
export function BundleUpsellModal({
  open, onClose, userSubscriptions, allBundles, onSuccess, referralStats, returnUrl,
}: BundleUpsellModalProps) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [usePoints, setUsePoints] = useState(false);

  const monthlySpend = userSubscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + (s.billingCycle === "yearly" ? Math.round(s.amount / 12) : s.amount), 0);

  const activePoints = referralStats?.points?.active ?? 0;

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
          {activePoints > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50">
              <Crown size={12} className="text-amber-500" />
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
                          {bundle.creditPoints && (
                            <span className="inline-flex items-center text-[9px] font-extrabold text-violet-700 bg-violet-100 border border-violet-200 px-1.5 py-0.5 rounded-full">
                              +{bundle.creditPoints.toLocaleString()} points included
                            </span>
                          )}
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
