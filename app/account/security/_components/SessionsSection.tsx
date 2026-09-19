"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Key, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { fetchSessions, revokeSession, revokeAllSessions } from "@/lib/api";

interface Session {
  id: string;
  device: string;
  location: string;
  userAgent: string | null;
  ipAddress: string;
  lastActive: string;
  createdAt: string;
}

const SESSIONS_PER_PAGE = 5;

function parseUserAgent(ua: string | null): string {
  if (!ua) return "Unknown Device";
  if (ua.includes("Windows")) {
    if (ua.includes("Chrome"))  return "Chrome on Windows";
    if (ua.includes("Firefox")) return "Firefox on Windows";
    if (ua.includes("Edg"))     return "Edge on Windows";
    return "Windows Device";
  }
  if (ua.includes("Macintosh")) {
    if (ua.includes("Chrome"))                          return "Chrome on macOS";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari on macOS";
    return "macOS Device";
  }
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS Device";
  if (ua.includes("Android")) return "Android Device";
  return ua.split(" ")[0] || "Unknown Device";
}

/**
 * SessionsSection — lists active sessions with per-session revocation and revoke-all.
 */
export function SessionsSection() {
  const [sessions, setSessions]         = useState<Session[]>([]);
  const [loading, setLoading]           = useState(true);
  const [revokeOpen, setRevokeOpen]     = useState<string | null>(null);
  const [revoking, setRevoking]         = useState<string | null>(null);
  const [page, setPage]                 = useState(1);

  useEffect(() => {
    fetchSessions()
      .then((data) => setSessions(data as Session[]))
      .catch((err) => console.error("Failed to fetch sessions", err))
      .finally(() => setLoading(false));
  }, []);

  const totalPages     = Math.max(1, Math.ceil(sessions.length / SESSIONS_PER_PAGE));
  const paginated      = sessions.slice((page - 1) * SESSIONS_PER_PAGE, page * SESSIONS_PER_PAGE);

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    try {
      await revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Session revoked successfully");
      setRevokeOpen(null);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to revoke session");
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    setRevoking("all");
    try {
      await revokeAllSessions();
      setSessions([]);
      toast.success("All sessions revoked successfully");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to revoke sessions");
    } finally {
      setRevoking(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Key size={18} className="text-primary" /> Active Sessions</CardTitle>
              <CardDescription>Manage your active sessions and devices</CardDescription>
            </div>
            {sessions.length > 1 && (
              <Button variant="outline" size="sm" onClick={handleRevokeAll} disabled={revoking === "all"}>
                {revoking === "all" && <Loader2 size={14} className="animate-spin mr-1" />} Revoke All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="animate-spin text-primary" size={24} />
              <p className="text-sm text-muted-foreground">Loading active sessions...</p>
            </div>
          ) : sessions.length > 0 ? (
            <>
              {paginated.map((session, idx) => {
                const globalIdx = (page - 1) * SESSIONS_PER_PAGE + idx;
                const isCurrent = globalIdx === sessions.length - 1;
                return (
                  <div key={session.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="space-y-1">
                      <p className="font-medium">{parseUserAgent(session.userAgent)}</p>
                      <p className="text-xs text-muted-foreground">IP: {session.ipAddress || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">Started: {new Date(session.createdAt).toLocaleString()}</p>
                      {isCurrent && <Badge className="mt-2">Current</Badge>}
                    </div>
                    {!isCurrent && (
                      <Button variant="outline" size="sm" onClick={() => setRevokeOpen(session.id)}>
                        <LogOut size={14} />
                      </Button>
                    )}
                  </div>
                );
              })}

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    {(page - 1) * SESSIONS_PER_PAGE + 1}–{Math.min(page * SESSIONS_PER_PAGE, sessions.length)} of {sessions.length} sessions
                  </p>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft size={14} />
                    </Button>
                    <span className="text-xs text-muted-foreground px-2">{page} / {totalPages}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No active sessions</p>
          )}
        </CardContent>
      </Card>

      {/* Revoke Confirm Dialog */}
      <Dialog open={!!revokeOpen} onOpenChange={() => setRevokeOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this session? You&apos;ll need to sign in again on that device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeOpen(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => revokeOpen && handleRevoke(revokeOpen)} disabled={revoking === revokeOpen}>
              {revoking === revokeOpen && <Loader2 size={14} className="animate-spin mr-1" />}
              Revoke Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
