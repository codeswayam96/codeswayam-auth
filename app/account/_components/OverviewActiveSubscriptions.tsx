import React from "react";
import Link from "next/link";
import { CreditCard, Tag, Clock, Zap, RefreshCcw, ArrowRight, ShoppingCart } from "lucide-react";

export interface OverviewProduct {
  id: string;
  name: string;
  status: "active" | "inactive";
  plan?: string;
  renewalDate?: string;
  expiresAt?: string;
  domain?: string;
  tag?: string;
}

interface OverviewActiveSubscriptionsProps {
  products: OverviewProduct[];
}

export function OverviewActiveSubscriptions({ products }: OverviewActiveSubscriptionsProps) {
  const activeProducts = products.filter((p) => p.status === "active");

  if (activeProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-14 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
          <ShoppingCart size={24} className="text-violet-600" />
        </div>
        <p className="text-base font-bold text-gray-900">No active subscriptions</p>
        <p className="mt-1 max-w-xs text-sm text-gray-400">
          Explore products and subscribe to see them here.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm shadow-violet-200 hover:opacity-90 transition-opacity"
        >
          <ShoppingCart size={14} /> Browse Products
        </Link>
      </div>
    );
  }

  const grouped = activeProducts.reduce((acc, p) => {
    const tag = p.tag || "Other Apps";
    if (!acc[tag]) acc[tag] = [];
    acc[tag].push(p);
    return acc;
  }, {} as Record<string, OverviewProduct[]>);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-6 py-4">
        <div className="flex items-center gap-2">
          <CreditCard size={15} className="text-violet-600" />
          <span className="text-sm font-bold text-gray-900">Active Subscriptions</span>
        </div>
        <span className="rounded-full bg-violet-100 px-3 py-0.5 text-xs font-bold text-violet-700">
          {activeProducts.length} active
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {Object.entries(grouped).map(([tag, groupProducts]) => (
          <div key={tag} className="px-6 py-4 space-y-3 bg-white">
            <div className="flex items-center gap-2">
              <Tag size={13} className="text-violet-500" />
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                {tag.replace(/-/g, " ")}
              </span>
              <span className="bg-violet-50 text-violet-600 text-[9px] font-bold px-1.5 py-px rounded-full border border-violet-100">
                {groupProducts.length} {groupProducts.length === 1 ? "plan" : "plans"}
              </span>
            </div>

            <div className="space-y-2.5">
              {groupProducts.map((product, i) => {
                const isExpired =
                  !!product.expiresAt && new Date(product.expiresAt).getTime() < Date.now();
                return (
                  <div
                    key={`${product.id}-${i}`}
                    className="flex items-center justify-between p-3 rounded-xl border transition-colors"
                    style={
                      isExpired
                        ? { backgroundColor: "#fff5f5", borderColor: "#fca5a5" }
                        : { backgroundColor: "rgba(0,0,0,0.01)", borderColor: "rgba(0,0,0,0.05)" }
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
                        style={
                          isExpired
                            ? { backgroundColor: "#fee2e2", borderColor: "#fca5a5" }
                            : { backgroundColor: "white", borderColor: "#ede9fe" }
                        }
                      >
                        {isExpired ? (
                          <Clock size={15} className="text-red-400" />
                        ) : (
                          <Zap size={15} className="text-violet-600" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold ${
                            isExpired ? "text-gray-500" : "text-gray-900"
                          }`}
                        >
                          {product.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          {product.plan && (
                            <span
                              className={`text-[10px] font-bold ${
                                isExpired ? "text-gray-400 line-through" : "text-violet-600"
                              }`}
                            >
                              {product.plan}
                            </span>
                          )}
                          <span
                            className={`text-[10px] ${
                              isExpired ? "text-red-500 font-semibold" : "text-gray-400"
                            }`}
                          >
                            {isExpired
                              ? `Expired ${product.expiresAt ? new Date(product.expiresAt).toLocaleDateString("en-IN") : ""}`
                              : `Renews ${product.renewalDate ? new Date(product.renewalDate).toLocaleDateString("en-IN") : "—"}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isExpired ? (
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-[11px] font-semibold text-red-700 bg-red-50 transition-colors hover:bg-red-600 hover:text-white hover:border-red-600"
                      >
                        <RefreshCcw size={10} /> Renew
                      </Link>
                    ) : (
                      <a
                        href={product.domain ? `https://${product.domain}` : "/account/subscriptions"}
                        target={product.domain ? "_blank" : "_self"}
                        rel={product.domain ? "noopener noreferrer" : undefined}
                        className="flex items-center gap-1.5 rounded-lg border border-violet-200 px-3 py-1.5 text-[11px] font-semibold text-violet-700 transition-colors hover:bg-violet-600 hover:text-white hover:border-violet-600"
                      >
                        {product.domain ? "Open App" : "Manage"} <ArrowRight size={10} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 p-4">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white shadow-sm shadow-violet-200 transition-opacity hover:opacity-90"
        >
          <ShoppingCart size={15} /> Browse More Products
        </Link>
      </div>
    </div>
  );
}
