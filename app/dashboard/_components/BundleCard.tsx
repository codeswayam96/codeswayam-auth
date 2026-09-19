"use client";

import { Crown, Layers, Sparkles, Star, TrendingDown } from "lucide-react";
import { RazorpayButton } from "@/components/razorpay-checkout";
import type { Bundle, BillingCycle } from "./types";
import { formatInr, yearlySaving, yearlySavingPct } from "./types";

interface BundleCardProps {
  bundle: Bundle;
  cycle: BillingCycle;
  redirectAfterPayment: string;
}

/**
 * BundleCard — premium bundle tile with "Best Value" ribbon, feature list, and pricing.
 */
export function BundleCard({ bundle, cycle, redirectAfterPayment }: BundleCardProps) {
  const price       = cycle === "yearly" ? bundle.yearlyInr : bundle.monthlyInr;
  const saving      = yearlySaving(bundle.monthlyInr, bundle.yearlyInr);
  const savePct     = yearlySavingPct(bundle.monthlyInr, bundle.yearlyInr);
  const includedCount = Math.max(bundle.features.length, 2);

  return (
    <div className="flex flex-col h-full rounded-[14px] border-2 border-violet-300 bg-violet-50 overflow-hidden relative transition-all duration-200 hover:shadow-[0_12px_40px_rgba(109,40,217,0.18)] hover:-translate-y-0.5">
      <div className="absolute top-0 right-0 bg-gradient-to-r from-violet-700 to-indigo-600 text-white text-[10px] font-extrabold px-3.5 py-1.5 rounded-bl-[10px] flex items-center gap-1.5 uppercase tracking-wider z-10">
        <Crown size={11} /> Best Value
      </div>
      <div className="p-6 flex flex-col flex-1">
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
        <p className="text-sm text-gray-500 leading-relaxed mb-5">
          {bundle.description || "The ultimate toolkit. Access our premium creative and productivity suite at a single low price."}
        </p>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider m-0 mb-2.5">What&apos;s Included</p>
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
            {price > 0 && <span className="text-sm text-gray-400 font-medium">/{cycle === "yearly" ? "yr" : "mo"}</span>}
          </div>
          {price > 0 && <p className="text-xs text-gray-400 m-0 mb-4">For all {includedCount} applications</p>}
          <RazorpayButton
            bundleId={Number(bundle.id)} billingCycle={cycle} currency="INR" planName={bundle.name}
            label={`Unlock All ${includedCount} Apps Now`} fullWidth size="lg"
            className="w-full font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20 rounded-[10px] h-[52px] text-base cursor-pointer flex items-center justify-center gap-2"
            icon={<Crown size={16} />}
            returnUrl={redirectAfterPayment} onSuccess={() => (window.location.href = redirectAfterPayment)}
          />
          <p className="text-center text-xs text-gray-400 mt-2">Instant access · Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}
