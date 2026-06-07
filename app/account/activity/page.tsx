"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Activity, LogIn, Lock, Shield, CreditCard, Smartphone, KeyRound,
  Settings, UserX, Loader2, AlertCircle, RefreshCw, MapPin, Monitor,
  Calendar, Clock,
} from "lucide-react";
import { apiFetch, revokeSession } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityEvent {
  id: string | number;
  type: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EVENT_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  login:               { label: "Sign In",               icon: <LogIn size={14} />,      color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  logout:              { label: "Sign Out",              icon: <LogIn size={14} />,      color: "text-slate-600",   bg: "bg-slate-50 border-slate-200" },
  password_change:     { label: "Password Changed",      icon: <Lock size={14} />,       color: "text-amber-700",   bg: "bg-amber-50 border-amber-200" },
  "2fa_enabled":       { label: "2FA Enabled",           icon: <Shield size={14} />,     color: "text-blue-700",    bg: "bg-blue-50 border-blue-200" },
  "2fa_disabled":      { label: "2FA Disabled",          icon: <Shield size={14} />,     color: "text-red-700",     bg: "bg-red-50 border-red-200" },
  subscription_create: { label: "Subscription Started",  icon: <CreditCard size={14} />, color: "text-violet-700",  bg: "bg-violet-50 border-violet-200" },
  subscription_cancel: { label: "Subscription Canceled", icon: <CreditCard size={14} />, color: "text-red-700",     bg: "bg-red-50 border-red-200" },
  session_revoke:      { label: "Session Revoked",       icon: <KeyRound size={14} />,   color: "text-orange-700",  bg: "bg-orange-50 border-orange-200" },
  profile_update:      { label: "Profile Updated",       icon: <Settings size={14} />,   color: "text-indigo-700",  bg: "bg-indigo-50 border-indigo-200" },
  account_delete:      { label: "Deletion Requested",    icon: <UserX size={14} />,      color: "text-red-700",     bg: "bg-red-50 border-red-200" },
  device_registered:   { label: "New Device",            icon: <Smartphone size={14} />, color: "text-teal-700",    bg: "bg-teal-50 border-teal-200" },
};

function getEventMeta(type: string) {
  return EVENT_META[type] || {
    label: type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    icon: <Activity size={14} />,
    color: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
  };
}

function parseUA(ua?: string): string {
  if (!ua) return "Unknown Device";
  if (ua.includes("Windows")) {
    if (ua.includes("Chrome")) return "Chrome · Windows";
    if (ua.includes("Firefox")) return "Firefox · Windows";
    if (ua.includes("Edg")) return "Edge · Windows";
    return "Windows";
  }
  if (ua.includes("Macintosh")) return ua.includes("Chrome") ? "Chrome · macOS" : "Safari · macOS";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS Device";
  if (ua.includes("Android")) return "Android Device";
  return "Unknown Device";
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatFull(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-start gap-4 px-5 py-4 animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded w-40" />
        <div className="h-3 bg-gray-100 rounded w-64" />
      </div>
      <div className="h-3 bg-gray-100 rounded w-16 mt-1" />
    </div>
  );
}

// ─── Event Row ────────────────────────────────────────────────────────────────

interface EventRowProps {
  event: ActivityEvent;
  isLast: boolean;
  onRevoke: (id: string | number) => void;
  revoking: boolean;
}

function EventRow({ event, isLast, onRevoke, revoking }: EventRowProps) {
  const meta = getEventMeta(event.type);
  return (
    <div className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors group ${!isLast ? "border-b border-gray-100" : ""}`}>
      {/* Icon */}
      <div className={`flex w-9 h-9 shrink-0 items-center justify-center rounded-xl border ${meta.bg} ${meta.color} shadow-sm mt-0.5`}>
        {meta.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${meta.color}`}>{meta.label}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-400">
          {event.ipAddress && (
            <span className="flex items-center gap-1">
              <MapPin size={10} /> {event.ipAddress}
            </span>
          )}
          {event.userAgent && (
            <span className="flex items-center gap-1">
              <Monitor size={10} /> {parseUA(event.userAgent)}
            </span>
          )}
          {event.description && (
            <span className="text-gray-400">{event.description}</span>
          )}
        </div>
      </div>

      {/* Timestamp & Revoke Action */}
      <div className="shrink-0 text-right flex items-center gap-3">
        <div>
          <p className="text-[11px] font-medium text-gray-400" title={formatFull(event.createdAt)}>
            {formatRelative(event.createdAt)}
          </p>
          <p className="text-[10px] text-gray-300 mt-0.5 hidden sm:block">
            {new Date(event.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </p>
        </div>
        {event.type === "login" && (
          <Button
            onClick={() => onRevoke(event.id)}
            disabled={revoking}
            variant="outline"
            className="h-8 text-[10px] font-bold text-red-600 hover:text-white hover:bg-red-500 hover:border-red-500 border-red-200 px-3 shrink-0"
          >
            {revoking ? <Loader2 size={10} className="animate-spin" /> : "Revoke"}
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Session-based Fallback (uses existing /users/sessions endpoint) ──────────

interface Session {
  id: string;
  userAgent: string | null;
  ipAddress: string;
  createdAt: string;
  lastActive?: string;
}

function sessionToActivity(s: Session): ActivityEvent {
  return {
    id: s.id,
    type: "login",
    ipAddress: s.ipAddress,
    userAgent: s.userAgent ?? undefined,
    createdAt: s.createdAt,
    description: s.lastActive ? `Last active: ${formatRelative(s.lastActive)}` : undefined,
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  
  // Revocation state
  const [revokingId, setRevokingId] = useState<string | number | null>(null);

  const load = async () => {
    setError("");
    try {
      // Try the dedicated activity endpoint first; fall back to session list
      let data: ActivityEvent[] = [];
      try {
        const res = await apiFetch("/users/activity");
        data = Array.isArray(res) ? res : (res?.events ?? res?.activity ?? []);
      } catch {
        // Fallback: use sessions as a proxy for recent logins
        const sessions: Session[] = await apiFetch("/users/sessions");
        data = sessions.map(sessionToActivity);
      }
      // Sort newest first
      setEvents(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setCurrentPage(1); // Reset page to 1 on reload
    } catch (err: any) {
      setError(err.message || "Failed to load activity");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRefresh = () => { setRefreshing(true); load(); };

  // Revoke session handler
  const handleRevokeSession = async (sessionId: string | number) => {
    if (!confirm("Are you sure you want to revoke this session? The device will be signed out immediately.")) {
      return;
    }

    setRevokingId(sessionId);
    try {
      await revokeSession(sessionId);
      toast.success("Session revoked successfully");
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke session");
    } finally {
      setRevokingId(null);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(events.length / pageSize);
  const paginatedEvents = useMemo(() => {
    return events.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [events, currentPage, pageSize]);

  return (
    <div className="space-y-6 pb-12">

      {/* ── Header ── */}
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
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      {events.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Events", value: String(events.length), icon: <Activity size={16} className="text-violet-600" />, border: "border-violet-100" },
            { label: "Sign Ins", value: String(events.filter(e => e.type === "login").length), icon: <LogIn size={16} className="text-emerald-600" />, border: "border-emerald-100" },
            { label: "Security Events", value: String(events.filter(e => ["password_change","2fa_enabled","2fa_disabled","session_revoke"].includes(e.type)).length), icon: <Shield size={16} className="text-amber-600" />, border: "border-amber-100" },
            { label: "Last Activity", value: formatRelative(events[0]?.createdAt ?? new Date().toISOString()), icon: <Clock size={16} className="text-blue-600" />, border: "border-blue-100" },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-2xl border ${s.border} p-4 shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                {s.icon}
              </div>
              <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}

      {/* ── Event List ── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Table header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-5 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <Calendar size={11} /> Chronological Log
          </p>
          {events.length > 0 && (
            <p className="text-xs text-gray-400">{events.length} event{events.length !== 1 ? "s" : ""}</p>
          )}
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 border border-gray-200">
              <Activity size={26} className="text-gray-300" />
            </div>
            <p className="text-base font-bold text-gray-900">No activity yet</p>
            <p className="mt-1 text-sm text-gray-400 max-w-xs">Account events will appear here as you use the platform.</p>
          </div>
        ) : (
          <div>
            {paginatedEvents.map((event, idx) => (
              <EventRow
                key={event.id ?? idx}
                event={event}
                isLast={idx === paginatedEvents.length - 1}
                onRevoke={handleRevokeSession}
                revoking={revokingId === event.id}
              />
            ))}
          </div>
        )}

        {/* Footer with Pagination */}
        {events.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <p className="text-xs text-gray-400">
                Showing {Math.min((currentPage - 1) * pageSize + 1, events.length)}–{Math.min(currentPage * pageSize, events.length)} of {events.length} events
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">Page Size:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-8 text-xs border border-gray-200 rounded-lg px-2 bg-white text-gray-600 focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 text-xs px-3"
              >
                Previous
              </Button>
              <span className="text-xs font-semibold px-2 text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-8 text-xs px-3"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
