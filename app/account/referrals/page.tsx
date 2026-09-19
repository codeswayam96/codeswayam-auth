"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchReferralStats, type ReferralStats } from "@/lib/api";
import { AlertCircle } from "lucide-react";
import { BrandLoader } from "@/components/brand-loader";
import {
  ReferralHeader,
  ReferralCodeBox,
  RedeemCodeForm,
  ReferralStatsCards,
  RedemptionHistoryTable,
} from "./_components";

export default function ReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    try {
      setStats(await fetchReferralStats());
    } catch (err: any) {
      setError(err.message || "Failed to load referral stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) return <BrandLoader size="md" text="Loading referral data..." />;

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <ReferralHeader />

      {/* ── Referral Card (Code & Redeem) ── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row">
          <ReferralCodeBox referralCode={stats?.referralCode} />
          <div className="h-px bg-gray-100 md:hidden" />
          <RedeemCodeForm onSuccess={loadStats} />
        </div>
      </div>

      {/* ── Stats Row ── */}
      <ReferralStatsCards stats={stats} />

      {/* ── Redemption History ── */}
      <RedemptionHistoryTable history={stats?.history} />
    </div>
  );
}