"use client";

import { useEffect, useState } from "react";
import { BellOff, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import {
  type Notification,
  NotifRow,
  SkeletonRow,
  NotifHeader,
  NotifFilterTabs,
} from "./_components";

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

  useEffect(() => {
    load();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleMarkRead = async (id: string | number) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await apiFetch(`/users/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    const prevNotifs = notifs;
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
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

  const unreadCount = notifs.filter((n) => !n.isRead).length;
  const filtered = filter === "unread" ? notifs.filter((n) => !n.isRead) : notifs;

  return (
    <div className="space-y-6 pb-12">
      <NotifHeader
        unreadCount={unreadCount}
        markingAll={markingAll}
        refreshing={refreshing}
        onMarkAllRead={handleMarkAllRead}
        onRefresh={handleRefresh}
      />

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}

      <NotifFilterTabs
        filter={filter}
        totalCount={notifs.length}
        unreadCount={unreadCount}
        onFilterChange={setFilter}
      />

      {/* ── List ── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center border-b border-gray-100 bg-gray-50/80 px-5 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            {filter === "unread" ? "Unread" : "All"} Notifications
          </p>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
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
            <p className="text-xs text-gray-400">
              {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
