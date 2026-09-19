"use client";

import { useEffect, useState, useMemo } from "react";
import { Activity, Calendar, AlertCircle } from "lucide-react";
import { apiFetch, revokeSession } from "@/lib/api";
import { toast } from "sonner";
import {
  type ActivityEvent,
  type Session,
  EventRow,
  SkeletonRow,
  ActivityStats,
  ActivityHeader,
  ActivityPagination,
  formatRelative,
} from "./_components";

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
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message || "Failed to load activity");
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
      <ActivityHeader onRefresh={handleRefresh} refreshing={refreshing} />

      <ActivityStats events={events} />

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}

      {/* ── Event List ── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-5 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <Calendar size={11} /> Chronological Log
          </p>
          {events.length > 0 && (
            <p className="text-xs text-gray-400">
              {events.length} event{events.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 border border-gray-200">
              <Activity size={26} className="text-gray-300" />
            </div>
            <p className="text-base font-bold text-gray-900">No activity yet</p>
            <p className="mt-1 text-sm text-gray-400 max-w-xs">
              Account events will appear here as you use the platform.
            </p>
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

        <ActivityPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalEvents={events.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}
