"use client";

import React from "react";
import { Activity, LogIn, Shield, Clock } from "lucide-react";
import type { ActivityEvent } from "./types";
import { formatRelative } from "./ActivityRow";

interface ActivityStatsProps {
  events: ActivityEvent[];
}

export function ActivityStats({ events }: ActivityStatsProps) {
  if (events.length === 0) return null;

  const totalEvents = events.length;
  const signIns = events.filter((e) => e.type === "login").length;
  const securityEvents = events.filter((e) =>
    ["password_change", "2fa_enabled", "2fa_disabled", "session_revoke"].includes(e.type)
  ).length;
  const lastActivity = formatRelative(events[0]?.createdAt ?? new Date().toISOString());

  const stats = [
    {
      label: "Total Events",
      value: String(totalEvents),
      icon: <Activity size={16} className="text-violet-600" />,
      border: "border-violet-100",
    },
    {
      label: "Sign Ins",
      value: String(signIns),
      icon: <LogIn size={16} className="text-emerald-600" />,
      border: "border-emerald-100",
    },
    {
      label: "Security Events",
      value: String(securityEvents),
      icon: <Shield size={16} className="text-amber-600" />,
      border: "border-amber-100",
    },
    {
      label: "Last Activity",
      value: lastActivity,
      icon: <Clock size={16} className="text-blue-600" />,
      border: "border-blue-100",
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
