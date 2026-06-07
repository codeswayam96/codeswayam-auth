"use client";

import { useEffect, useState } from "react";
import {
  Bell, BellOff, CheckCheck, AlertCircle, RefreshCw,
  CreditCard, Shield, Zap, Info, Tag, Loader2, Check,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string | number;
  type: string;
  title: string;
  body?: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NOTIF_META: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  billing:      { icon: <CreditCard size={14} />, color: "text-violet-700", bg: "bg-violet-50 border-violet-200"  },
  security:     { icon: <Shield size={14} />,     color: "text-red-700",    bg: "bg-red-50 border-red-200"        },
  subscription: { icon: <Zap size={14} />,        color: "text-emerald-700",bg: "bg-emerald-50 border-emerald-200"},
  promo:        { icon: <Tag size={14} />,         color: "text-amber-700",  bg: "bg-amber-50 border-amber-200"   },
  system:       { icon: <Info size={14} />,        color: "text-blue-700",   bg: "bg-blue-50 border-blue-200"     },
};

function getNotifMeta(type: string) {
  return NOTIF_META[type] || NOTIF_META.system;
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-start gap-4 px-5 py-4 animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded w-48" />
        <div className="h-3 bg-gray-100 rounded w-72" />
      </div>
      <div className="h-3 bg-gray-100 rounded w-14" />
    </div>
  );
}

// ─── Notification Row ─────────────────────────────────────────────────────────

function NotifRow({ notif, onMarkRead, isLast }: {
  notif: Notification;
  onMarkRead: (id: string | number) => void;
  isLast: boolean;
}) {
  const meta = getNotifMeta(notif.type);
  const text = notif.body || notif.message || "";
  return (
    <div className={`group flex items-start gap-4 px-5 py-4 transition-colors ${!notif.isRead ? "bg-violet-50/30" : "hover:bg-gray-50/50"} ${!isLast ? "border-b border-gray-100" : ""}`}>
      {/* Icon */}
      <div className={`flex w-9 h-9 shrink-0 items-center justify-center rounded-xl border ${meta.bg} ${meta.color} shadow-sm mt-0.5`}>
        {meta.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-semibold ${notif.isRead ? "text-gray-700" : "text-gray-900"}`}>
            {notif.title}
          </p>
          {!notif.isRead && (
            <span className="w-2 h-2 rounded-full bg-violet-600 shrink-0" />
          )}
        </div>
        {text && (
          <p className="mt-0.5 text-xs text-gray-400 line-clamp-2 leading-relaxed">{text}</p>
        )}
      </div>

      {/* Time + Action */}
      <div className="shrink-0 flex flex-col items-end gap-1.5">
        <p className="text-[11px] text-gray-400">{formatRelative(notif.createdAt)}</p>
        {!notif.isRead && (
          <button
            onClick={() => onMarkRead(notif.id)}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-semibold text-violet-600 hover:text-violet-800 transition-all"
            title="Mark as read"
          >
            <Check size={10} /> Read
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const load = async () => {
    setError("");
    try {
      const res = await apiFetch("/users/notifications");
      const data: Notification[] = Array.isArray(res) ? res : (res?.notifications ?? []);
      setNotifs(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      // If endpoint doesn't exist, show a graceful empty state (not an error)
      if (err.message?.includes("404") || err.message?.includes("Cannot GET")) {
        setNotifs([]);
      } else {
        setError(err.message || "Failed to load notifications");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRefresh = () => { setRefreshing(true); load(); };

  const handleMarkRead = async (id: string | number) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await apiFetch(`/users/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      // Revert optimistic update on failure
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    const prevNotifs = notifs;
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await apiFetch("/users/notifications/read-all", { method: "PATCH" });
      toast.success("All notifications marked as read");
    } catch {
      setNotifs(prevNotifs);
      toast.error("Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifs.filter(n => !n.isRead).length;
  const filtered = filter === "unread" ? notifs.filter(n => !n.isRead) : notifs;

  return (
    <div className="space-y-6 pb-12">

      {/* ── Header ── */}
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
            <p className="mt-1.5 text-sm opacity-60 max-w-xs">Billing alerts, security events, and platform updates.</p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/20 transition-colors"
              >
                {markingAll ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={12} />}
                Mark all read
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}

      {/* ── Filter Tabs ── */}
      {notifs.length > 0 && (
        <div className="flex gap-1 border-b border-gray-200">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`-mb-px px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors capitalize ${
                filter === f ? "border-violet-600 text-violet-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {f === "all" ? "All" : "Unread"}
              <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                filter === f ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-500"
              }`}>
                {f === "all" ? notifs.length : unreadCount}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── List ── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center border-b border-gray-100 bg-gray-50/80 px-5 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            {filter === "unread" ? "Unread" : "All"} Notifications
          </p>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 border border-gray-200">
              <BellOff size={26} className="text-gray-300" />
            </div>
            <p className="text-base font-bold text-gray-900">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
            <p className="mt-1 text-sm text-gray-400 max-w-xs leading-relaxed">
              {filter === "unread"
                ? "You're all caught up! Switch to 'All' to see past notifications."
                : "Billing alerts, security events, and platform updates will appear here."}
            </p>
            {filter === "unread" && (
              <button
                onClick={() => setFilter("all")}
                className="mt-4 text-sm font-semibold text-violet-600 hover:text-violet-800 transition-colors"
              >
                View all notifications →
              </button>
            )}
          </div>
        ) : (
          <div>
            {filtered.map((notif, idx) => (
              <NotifRow
                key={notif.id}
                notif={notif}
                onMarkRead={handleMarkRead}
                isLast={idx === filtered.length - 1}
              />
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-3">
            <p className="text-xs text-gray-400">{filtered.length} notification{filtered.length !== 1 ? "s" : ""}</p>
          </div>
        )}
      </div>
    </div>
  );
}
