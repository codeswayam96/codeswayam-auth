"use client";

import React from "react";
import {
  Activity, LogIn, Lock, Shield, CreditCard, Smartphone, KeyRound,
  Settings, UserX, Loader2, MapPin, Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActivityEvent } from "./types";

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

export function getEventMeta(type: string) {
  return EVENT_META[type] || {
    label: type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    icon: <Activity size={14} />,
    color: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
  };
}

export function parseUA(ua?: string): string {
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

export function formatRelative(dateStr: string): string {
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

export function formatFull(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function SkeletonRow() {
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

export interface EventRowProps {
  event: ActivityEvent;
  isLast: boolean;
  onRevoke: (id: string | number) => void;
  revoking: boolean;
}

export function EventRow({ event, isLast, onRevoke, revoking }: EventRowProps) {
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
