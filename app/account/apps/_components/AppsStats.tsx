import React from "react";
import { CheckCircle2, LayoutGrid, XCircle, Zap } from "lucide-react";
import type { UserSubscription } from "@/lib/api";

interface AppsStatsProps {
  subs: UserSubscription[];
  activeSubs: UserSubscription[];
  inactiveSubs: UserSubscription[];
}

export function AppsStats({ subs, activeSubs, inactiveSubs }: AppsStatsProps) {
  if (subs.length === 0) return null;

  const monthlySpendPaise = activeSubs.reduce(
    (s, sub) =>
      s +
      (sub.billingCycle === "yearly"
        ? Math.round(sub.amount / 12)
        : sub.amount),
    0
  );

  const stats = [
    {
      label: "Active Apps",
      value: activeSubs.length,
      icon: <CheckCircle2 size={16} className="text-emerald-600" />,
      border: "border-emerald-100",
    },
    {
      label: "Total Apps",
      value: subs.length,
      icon: <LayoutGrid size={16} className="text-violet-600" />,
      border: "border-violet-100",
    },
    {
      label: "Inactive",
      value: inactiveSubs.length,
      icon: <XCircle size={16} className="text-gray-400" />,
      border: "border-gray-200",
    },
    {
      label: "Monthly Spend",
      value: `₹${(monthlySpendPaise / 100) | 0}`,
      icon: <Zap size={16} className="text-amber-600" />,
      border: "border-amber-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className={`bg-white rounded-2xl border ${s.border} p-4 shadow-sm`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {s.label}
            </p>
            {s.icon}
          </div>
          <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
