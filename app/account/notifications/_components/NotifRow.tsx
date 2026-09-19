"use client";

import React from "react";
import { CreditCard, Shield, Zap, Info, Tag, Check } from "lucide-react";
import type { Notification } from "./types";

const NOTIF_META: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  billing:      { icon: <CreditCard size={14} />, color: "text-violet-700", bg: "bg-violet-50 border-violet-200"  },
  security:     { icon: <Shield size={14} />,     color: "text-red-700",    bg: "bg-red-50 border-red-200"        },
  subscription: { icon: <Zap size={14} />,        color: "text-emerald-700",bg: "bg-emerald-50 border-emerald-200"},
  promo:        { icon: <Tag size={14} />,        color: "text-amber-700",  bg: "bg-amber-50 border-amber-200"   },
  system:       { icon: <Info size={14} />,       color: "text-blue-700",   bg: "bg-blue-50 border-blue-200"     },
};

export function getNotifMeta(type: string) {
  return NOTIF_META[type] || NOTIF_META.system;
}

export function formatRelative(dateStr: string): string {
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

export function SkeletonRow() {
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

export function NotifRow({
  notif,
  onMarkRead,
  isLast,
}: {
  notif: Notification;
  onMarkRead: (id: string | number) => void;
  isLast: boolean;
}) {
  const meta = getNotifMeta(notif.type);
  const text = notif.body || notif.message || "";
  return (
    <div
      className={`group flex items-start gap-4 px-5 py-4 transition-colors ${
        !notif.isRead ? "bg-violet-50/30" : "hover:bg-gray-50/50"
      } ${!isLast ? "border-b border-gray-100" : ""}`}
    >
      {/* Icon */}
      <div
        className={`flex w-9 h-9 shrink-0 items-center justify-center rounded-xl border ${meta.bg} ${meta.color} shadow-sm mt-0.5`}
      >
        {meta.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-semibold ${notif.isRead ? "text-gray-700" : "text-gray-900"}`}>
            {notif.title}
          </p>
          {!notif.isRead && <span className="w-2 h-2 rounded-full bg-violet-600 shrink-0" />}
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
