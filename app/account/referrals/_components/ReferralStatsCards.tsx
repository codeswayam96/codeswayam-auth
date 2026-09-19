import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Shield, Coins, Loader2, AlertCircle } from "lucide-react";
import type { ReferralStats } from "@/lib/api";

interface ReferralStatsCardsProps {
  stats: ReferralStats | null;
}

export function ReferralStatsCards({ stats }: ReferralStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-gray-100 shadow-sm">
        <CardContent className="flex items-center gap-4 p-4 sm:p-6">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50">
            <Users size={20} className="text-violet-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500">Total Redeemed</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {stats?.totalRedeemed ?? 0}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
          <Shield className="w-12 h-12 text-emerald-600" />
        </div>
        <CardContent className="flex items-center gap-4 p-4 sm:p-6">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
            <Coins size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500">Active Points</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {stats?.points?.active ?? 0}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-100 shadow-sm bg-amber-50/30 border-dashed">
        <CardContent className="flex items-center gap-4 p-4 sm:p-6">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
            <Loader2 size={20} className="text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Pending</p>
              <div className="group relative cursor-help">
                <AlertCircle size={10} className="text-gray-400" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                  Held for 7 days to prevent fraud.
                </div>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {stats?.points?.pending ?? 0}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
