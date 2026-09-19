"use client";

import React from "react";
import { Activity, RefreshCw } from "lucide-react";

interface ActivityHeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
}

export function ActivityHeader({ onRefresh, refreshing }: ActivityHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-violet-800 px-6 py-7 text-white shadow-xl shadow-violet-900/10">
      <div className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-16 bottom-0 opacity-[0.06]">
        <Activity size={140} />
      </div>
      <div className="relative flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">Security</p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Account Activity</h1>
          <p className="mt-1.5 text-sm opacity-60 max-w-xs">
            A full audit trail of every action taken on your account.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>
    </div>
  );
}
