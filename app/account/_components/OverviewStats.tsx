import React from "react";
import Link from "next/link";
import { Package, TrendingUp, Zap, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface OverviewStatsProps {
  activeProducts: number;
  monthlyCost: string;
  userStatus?: string;
  memberSince: string;
  creditBalance: number | null;
}

export function OverviewStats({
  activeProducts,
  monthlyCost,
  userStatus,
  memberSince,
  creditBalance,
}: OverviewStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
      <Card className="overflow-hidden border-gray-100 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Active Products
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
              <Package size={15} className="text-violet-600" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">{activeProducts}</p>
          <div className="mt-3 h-1 w-full rounded-full bg-violet-100">
            <div
              className="h-1 rounded-full bg-violet-500 transition-all duration-500"
              style={{ width: `${Math.min(activeProducts * 25, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-gray-100 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Monthly Cost
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <TrendingUp size={15} className="text-emerald-600" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">{monthlyCost}</p>
          <div className="mt-3 h-1 w-full rounded-full bg-emerald-100">
            <div className="h-1 w-3/5 rounded-full bg-emerald-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-gray-100 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Account Status
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
              <Zap size={15} className="text-violet-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full animate-pulse ${
                userStatus === "inactive" ? "bg-amber-400" : "bg-green-500"
              }`}
            />
            <span className="text-xl font-extrabold capitalize text-gray-900">
              {userStatus || "Active"}
            </span>
          </div>
          <div className="mt-3 h-1 w-full rounded-full bg-violet-100">
            <div className="h-1 w-full rounded-full bg-violet-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-gray-100 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Member Since
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <Clock size={15} className="text-amber-500" />
            </div>
          </div>
          <p className="mt-3 text-xl font-extrabold text-gray-900">{memberSince}</p>
          <div className="mt-3 h-1 w-full rounded-full bg-amber-100">
            <div className="h-1 w-2/5 rounded-full bg-amber-400" />
          </div>
        </CardContent>
      </Card>

      {/* Credit Balance card */}
      <Link href="/account/credits" className="col-span-2 md:col-span-1">
        <Card className="overflow-hidden border-indigo-100 shadow-sm bg-gradient-to-br from-indigo-50 to-violet-50 h-full hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                Credits
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                <Zap size={15} className="text-indigo-600" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-indigo-900">
              {creditBalance !== null ? creditBalance.toLocaleString() : "—"}
            </p>
            <p className="text-[10px] font-bold text-indigo-400 mt-0.5">pts available</p>
            <div className="mt-3 h-1 w-full rounded-full bg-indigo-100">
              <div className="h-1 w-1/2 rounded-full bg-indigo-400" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
