"use client";

import { Zap } from "lucide-react";
import Link from "next/link";
import type { UserSubscription } from "@/lib/api";
import { formatAmount } from "@/types";

interface PastSubscriptionRowProps {
  sub: UserSubscription;
}

/**
 * PastSubscriptionRow — compact read-only row for cancelled/inactive subscriptions.
 */
export function PastSubscriptionRow({ sub }: PastSubscriptionRowProps) {
  return (
    <div className="rounded-[10px] border border-gray-200 bg-gray-50 px-[18px] py-3.5 flex items-center justify-between gap-3 opacity-65">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
          <Zap size={15} className="text-gray-400" />
        </div>
        <div>
          <p className="m-0 mb-0.5 text-sm font-semibold text-gray-700">
            {sub.productName || sub.bundleName || "Plan"}
          </p>
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
  );
}
