import React from "react";
import { Bell, CheckCheck, Loader2, RefreshCw } from "lucide-react";

interface NotifHeaderProps {
  unreadCount: number;
  markingAll: boolean;
  refreshing: boolean;
  onMarkAllRead: () => void;
  onRefresh: () => void;
}

export function NotifHeader({
  unreadCount,
  markingAll,
  refreshing,
  onMarkAllRead,
  onRefresh,
}: NotifHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-violet-800 px-6 py-7 text-white shadow-xl">
      <div className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-16 bottom-0 opacity-[0.06]">
        <Bell size={140} />
      </div>
      <div className="relative flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">Inbox</p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm font-bold px-2.5 py-1 bg-violet-500 rounded-full shadow-lg shadow-violet-700/30">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="mt-1.5 text-sm opacity-60 max-w-xs">
            Billing alerts, security events, and platform updates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/20 transition-colors"
            >
              {markingAll ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={12} />}
              Mark all read
            </button>
          )}
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
