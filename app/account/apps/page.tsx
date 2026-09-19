"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Globe, ArrowRight, Layers, AlertCircle } from "lucide-react";
import { fetchUserSubscriptions, fetchSaasProducts } from "@/lib/api";
import type { UserSubscription, SaasProduct } from "@/lib/api";
import {
  AppCard,
  SkeletonCard,
  AppsHeader,
  AppsStats,
} from "./_components";

export default function AppsPage() {
  const [subs, setSubs] = useState<UserSubscription[]>([]);
  const [products, setProducts] = useState<SaasProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setError("");
    try {
      const [subsData, prodsData] = await Promise.all([
        fetchUserSubscriptions().catch(() => []),
        fetchSaasProducts().catch(() => []),
      ]);
      const subsArr: UserSubscription[] = Array.isArray(subsData)
        ? subsData
        : (subsData as any)?.subscriptions ?? [];
      setSubs(subsArr);
      setProducts(Array.isArray(prodsData) ? prodsData : []);
    } catch (err: any) {
      setError(err.message || "Failed to load apps");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  const productMap = new Map(products.map((p) => [String(p.id), p]));
  const activeSubs = subs.filter((s) => s.status === "active");
  const inactiveSubs = subs.filter((s) => s.status !== "active");

  return (
    <div className="space-y-6 pb-12">
      <AppsHeader refreshing={refreshing} onRefresh={handleRefresh} />

      {!loading && (
        <AppsStats
          subs={subs}
          activeSubs={activeSubs}
          inactiveSubs={inactiveSubs}
        />
      )}

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}

      {/* ── Active Apps ── */}
      {loading ? (
        <div>
          <p className="text-sm font-semibold text-gray-500 mb-3">Active Apps</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      ) : activeSubs.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <h2 className="text-sm font-bold text-gray-700">
              Active — {activeSubs.length} app{activeSubs.length !== 1 ? "s" : ""}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeSubs.map((sub) => (
              <AppCard
                key={sub.id}
                sub={sub}
                product={sub.saasProductId ? productMap.get(String(sub.saasProductId)) : undefined}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-gray-200 shadow-sm">
            <Layers size={26} className="text-gray-300" />
          </div>
          <p className="text-base font-bold text-gray-900">No active apps</p>
          <p className="mt-1.5 text-sm text-gray-400 max-w-xs leading-relaxed">
            Subscribe to any product from the dashboard to see your apps here.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm"
          >
            <Globe size={14} /> Browse Products <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* ── Inactive/Expired ── */}
      {!loading && inactiveSubs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <XCircle size={16} className="text-gray-400" />
            <h2 className="text-sm font-bold text-gray-500">
              Inactive / Expired — {inactiveSubs.length}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {inactiveSubs.map((sub) => (
              <AppCard
                key={sub.id}
                sub={sub}
                product={sub.saasProductId ? productMap.get(String(sub.saasProductId)) : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
