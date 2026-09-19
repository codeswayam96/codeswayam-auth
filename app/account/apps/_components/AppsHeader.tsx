import React from "react";
import Link from "next/link";
import { LayoutGrid, RefreshCw, Sparkles } from "lucide-react";

interface AppsHeaderProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export function AppsHeader({ refreshing, onRefresh }: AppsHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-violet-800 px-6 py-7 text-white shadow-xl">
      <div className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-16 bottom-0 opacity-[0.06]">
        <LayoutGrid size={140} />
      </div>
      <div className="relative flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">Platform</p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">My Apps</h1>
          <p className="mt-1.5 text-sm opacity-60 max-w-xs">
            All your subscribed platform applications in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white text-violet-700 text-xs font-bold border border-white transition-colors hover:bg-violet-50"
          >
            <Sparkles size={13} /> Browse More Apps
          </Link>
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
    </div>
  );
}
