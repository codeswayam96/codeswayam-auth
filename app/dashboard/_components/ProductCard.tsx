"use client";

import { CheckCircle2, ChevronRight, Package, TrendingDown } from "lucide-react";
import Link from "next/link";
import { RazorpayButton } from "@/components/razorpay-checkout";
import type { SaaSProduct, BillingCycle } from "./types";
import { formatInr, yearlySaving, yearlySavingPct } from "./types";

const STATUS_CFG: Record<string, string> = {
  active:      "bg-green-50 text-green-700 border border-green-200",
  beta:        "bg-blue-50 text-blue-700 border border-blue-200",
  coming_soon: "bg-amber-50 text-amber-700 border border-amber-200",
};
const STATUS_LABELS: Record<string, string> = {
  active: "Active", beta: "Beta", coming_soon: "Coming Soon",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${STATUS_CFG[status] ?? STATUS_CFG.active}`}>
      {STATUS_LABELS[status] ?? "Active"}
    </span>
  );
}

interface ProductCardProps {
  product: SaaSProduct;
  cycle: BillingCycle;
  redirectAfterPayment: string;
}

/**
 * ProductCard — renders a single subscribable SaaS product tile.
 */
export function ProductCard({ product, cycle, redirectAfterPayment }: ProductCardProps) {
  const price      = cycle === "yearly" ? product.yearlyInr : product.monthlyInr;
  const isComingSoon = product.status === "coming_soon";
  const saving     = yearlySaving(product.monthlyInr, product.yearlyInr);
  const savePct    = yearlySavingPct(product.monthlyInr, product.yearlyInr);

  return (
    <div className={`flex flex-col h-full rounded-xl border border-gray-200 bg-white overflow-hidden transition-all duration-200 hover:shadow-[0_8px_30px_rgba(109,40,217,0.12)] hover:-translate-y-0.5 hover:border-violet-300 ${isComingSoon ? "opacity-60 pointer-events-none" : ""}`}>
      <div className="h-[3px] bg-gradient-to-r from-violet-500 to-indigo-500 shrink-0" />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{product.category}</span>
          <StatusBadge status={product.status} />
        </div>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-700 shrink-0">
            <Package size={22} />
          </div>
          <div className="min-w-0 pt-0.5">
            <h3 className="font-bold text-[17px] leading-tight text-gray-900 m-0 truncate">{product.name}</h3>
            {product.planTier && <span className="text-[11px] font-semibold text-violet-700 block mt-0.5 capitalize">{product.planTier} tier</span>}
          </div>
        </div>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-4 line-clamp-2">
          {product.description || "Powerful SaaS tool for your workflow."}
        </p>
        {product.features.length > 0 && (
          <ul className="list-none p-0 m-0 mb-4 flex flex-col gap-1.5 flex-1">
            {product.features.slice(0, 4).map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-gray-700">
                <CheckCircle2 size={14} className="text-violet-700 shrink-0 mt-0.5" /> <span>{f}</span>
              </li>
            ))}
            {product.features.length > 4 && (
              <li className="text-xs text-violet-700 font-semibold pl-[22px]">+{product.features.length - 4} more features</li>
            )}
          </ul>
        )}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-[26px] font-black text-gray-900 tracking-tight">{formatInr(price)}</span>
              {price > 0 && <span className="text-[13px] text-gray-400">/{cycle === "yearly" ? "yr" : "mo"}</span>}
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
          {price === 0 ? (
            <Link href="/account/subscriptions" className="flex items-center justify-center gap-1 w-full h-10 rounded-lg bg-violet-700 text-white text-sm font-semibold no-underline">
              Start for Free <ChevronRight size={15} />
            </Link>
          ) : isComingSoon ? (
            <button disabled className="w-full h-10 rounded-lg bg-gray-100 text-gray-400 text-sm font-semibold border-none cursor-not-allowed">Coming Soon</button>
          ) : (
            <RazorpayButton
              saasProductId={Number(product.id)} billingCycle={cycle} currency="INR" planName={product.name}
              label={cycle === "yearly" ? "Get Annual Plan" : "Subscribe Now"}
              fullWidth size="default" className="w-full font-semibold rounded-lg h-10"
              returnUrl={redirectAfterPayment} onSuccess={() => (window.location.href = redirectAfterPayment)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
