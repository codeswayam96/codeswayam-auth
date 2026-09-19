"use client";

import { Tag } from "lucide-react";
import type { UserSubscription } from "@/lib/api";
import type { PublicProduct, PublicBundle } from "@/types";
import { SubscriptionCard } from "./SubscriptionCard";

interface SubscriptionGroupProps {
  family: string;
  label: string;
  subscriptions: UserSubscription[];
  allProducts: PublicProduct[];
  allBundles: PublicBundle[];
  onUpgrade: (sub: UserSubscription) => void;
  onBundle: () => void;
  onCancel: (id: number) => void;
}

/**
 * SubscriptionGroup — renders a product-family section header
 * followed by its SubscriptionCards.
 */
export function SubscriptionGroup({
  label, subscriptions, allProducts, allBundles, onUpgrade, onBundle, onCancel,
}: SubscriptionGroupProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 px-1 mt-2">
        <Tag size={17} className="text-violet-600" />
        <h2 className="text-base font-bold text-gray-900 capitalize tracking-tight">
          {label.replace(/-/g, " ")}
        </h2>
        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">
          {subscriptions.length} {subscriptions.length === 1 ? "plan" : "plans"}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {subscriptions.map((sub) => (
          <SubscriptionCard
            key={sub.id}
            sub={sub}
            allProducts={allProducts}
            allBundles={allBundles}
            onUpgrade={onUpgrade}
            onBundle={onBundle}
            onCancel={onCancel}
          />
        ))}
      </div>
    </div>
  );
}
