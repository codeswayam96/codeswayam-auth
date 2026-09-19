"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Crown, Layers, Package, RefreshCcw, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { fetchUserSubscriptions, type UserSubscription } from "@/lib/api";
import { formatAmount, isSubscriptionExpired } from "@/types";
import { BrandLoader } from "@/components/brand-loader";

/**
 * SubscriptionSummary — compact subscription widget for the profile page.
 * Shows up to 3 active plans with expired detection, monthly spend, and quick actions.
 */
export function SubscriptionSummary() {
  const [subs, setSubs]     = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserSubscriptions()
      .then((data: any) => setSubs(Array.isArray(data) ? data : (data?.subscriptions ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active = subs.filter((s) => s.status === "active");
  const totalMonthly = active.reduce((sum, s) => {
    return sum + (s.billingCycle === "yearly" ? Math.round(s.amount / 12) : s.amount);
  }, 0);
  const hasBundles = active.some((s) => !!s.bundleId);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <BrandLoader size="sm" text="Syncing plans..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
          <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs text-muted-foreground">
            <Link href="/account/subscriptions">Manage <ArrowRight size={10} className="ml-1" /></Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-3 space-y-3">
        {active.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 flex flex-col items-center text-center gap-3">
            <Package size={24} className="text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No active subscriptions yet.</p>
            <Button size="sm" asChild>
              <Link href="/dashboard"><Zap size={12} className="mr-1.5" /> Browse Products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              {active.slice(0, 3).map((sub) => {
                const expired = isSubscriptionExpired(sub.expiresAt);
                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2.5 transition-colors"
                    style={expired
                      ? { backgroundColor: "#fff5f5", borderColor: "#fca5a5" }
                      : { backgroundColor: "rgba(0,0,0,0.02)", borderColor: "rgba(0,0,0,0.07)" }
                    }
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${expired ? "" : "bg-background border-border/60"}`}
                        style={expired ? { backgroundColor: "#fee2e2", borderColor: "#fca5a5" } : {}}
                      >
                        {expired
                          ? <Clock size={13} className="text-red-500" />
                          : sub.bundleId
                            ? <Layers size={13} className="text-muted-foreground" />
                            : <Zap size={13} className="text-muted-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium leading-none truncate ${expired ? "text-gray-500" : ""}`}>
                          {sub.productName || sub.bundleName || "Plan"}
                        </p>
                        <p className={`mt-1 text-xs capitalize ${expired ? "text-red-500 font-semibold" : "text-muted-foreground"}`}>
                          {sub.billingCycle} · {formatAmount(sub.amount, sub.currency)}
                          {expired && sub.expiresAt && (
                            <> · Expired {new Date(sub.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {expired ? (
                        <>
                          <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Expired</span>
                          <Link href="/dashboard" className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:underline">
                            <RefreshCcw size={10} /> Renew
                          </Link>
                        </>
                      ) : (
                        <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Active</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {active.length > 3 && (
                <p className="text-xs text-muted-foreground text-center pt-0.5">
                  +{active.length - 3} more ·{" "}
                  <Link href="/account/subscriptions" className="text-primary hover:underline">view all</Link>
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/40">
              <div>
                <p className="text-xs text-muted-foreground">Monthly spend</p>
                <p className="text-2xl font-bold leading-none mt-0.5">{formatAmount(totalMonthly, "INR")}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {hasBundles && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground border border-border/60 px-2 py-1 rounded-full">
                    <Crown size={9} /> Bundle
                  </span>
                )}
                <Button variant="outline" size="sm" className="h-8 text-[11px] sm:text-xs px-2 sm:px-3" asChild>
                  <Link href="/account/subscriptions"><TrendingUp size={11} className="mr-1" /> Upgrade</Link>
                </Button>
                <Button size="sm" className="h-8 text-[11px] sm:text-xs px-2 sm:px-3" asChild>
                  <Link href="/dashboard"><Package size={11} className="mr-1" /> Add</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
