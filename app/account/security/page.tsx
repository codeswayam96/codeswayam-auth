"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Shield, Lock, Eye, EyeOff, Loader2, Key, Smartphone, LogOut, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useAccount } from "../layout";
import {
  changePassword,
  fetchSessions,
  revokeSession,
  revokeAllSessions,
  generate2FA,
  enable2FA,
  disable2FA,
  deleteAccount
} from "@/lib/api";

interface Session {
  id: string;
  device: string;
  location: string;
  userAgent: string | null;
  ipAddress: string;
  lastActive: string;
  createdAt: string;
}

export default function SecurityPage() {
  const { user } = useAccount();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);

  useEffect(() => {
    if (user) {
      setTwoFactorEnabled(user.twoFactorEnabled);
    }
  }, [user]);
  const [showingTwoFactorSetup, setShowingTwoFactorSetup] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);

  const start2FASetup = async () => {
    setSetupLoading(true);
    try {
      const data = await generate2FA();
      setQrCode(data.qrCodeDataUrl);
      setSetupSecret(data.secret);
      setShowingTwoFactorSetup(true);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSetupLoading(false);
    }
  };

  const verifyAndEnable2FA = async () => {
    setSetupLoading(true);
    try {
      await enable2FA(setupSecret, setupToken);
      setTwoFactorEnabled(true);
      setShowingTwoFactorSetup(false);
      setSetupToken("");
      toast.success("Two-factor authentication enabled successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSetupLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setSetupLoading(true);
    try {
      await disable2FA();
      setTwoFactorEnabled(false);
      toast.success("Two-factor authentication disabled");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSetupLoading(false);
    }
  };

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const data = await fetchSessions();
      setSessions(data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const [revokeOpen, setRevokeOpen] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  // Sessions pagination
  const SESSIONS_PER_PAGE = 5;
  const [sessionsPage, setSessionsPage] = useState(1);
  const sessionsTotalPages = Math.max(1, Math.ceil(sessions.length / SESSIONS_PER_PAGE));
  const paginatedSessions = sessions.slice((sessionsPage - 1) * SESSIONS_PER_PAGE, sessionsPage * SESSIONS_PER_PAGE);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const parseUserAgent = (ua: string | null) => {
    if (!ua) return "Unknown Device";
    if (ua.includes("Windows")) {
        if (ua.includes("Chrome")) return "Chrome on Windows";
        if (ua.includes("Firefox")) return "Firefox on Windows";
        if (ua.includes("Edg")) return "Edge on Windows";
        return "Windows Device";
    }
    if (ua.includes("Macintosh")) {
        if (ua.includes("Chrome")) return "Chrome on macOS";
        if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari on macOS";
        return "macOS Device";
    }
    if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS Device";
    if (ua.includes("Android")) return "Android Device";
    return ua.split(" ")[0] || "Unknown Device";
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      await revokeSession(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
      toast.success("Session revoked successfully");
      setRevokeOpen(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke session");
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAllSessions = async () => {
    setRevoking("all");
    try {
      await revokeAllSessions();
      setSessions([]);
      toast.success("All sessions revoked successfully");
      window.location.reload(); // Since we revoked our own session too
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke sessions");
    } finally {
      setRevoking(null);
    }
  };

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      toast.success("Account deletion request submitted for admin approval");
      setDeleteOpen(false);
      // Optional: Redirect or show a specific state
    } catch (err: any) {
      toast.error(err.message || "Failed to request account deletion");
    } finally {
      setDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Password Management - Hidden for Google Auth users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock size={18} className="text-primary" />
            Change Password
          </CardTitle>
          <CardDescription>
            {user.googleId 
              ? "Your security is managed by Google" 
              : "Update your password to secure your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user.googleId ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="p-3 bg-blue-50 rounded-full">
                <Shield size={32} className="text-blue-600" />
              </div>
              <div className="max-w-sm space-y-2">
                <p className="text-sm font-medium">You are signed in with Google</p>
                <p className="text-xs text-muted-foreground">
                  Since you use Google to sign in, you don't have a separate password for CodeSwayam. 
                  To manage your account security, please visit your Google Account settings.
                </p>
              </div>
              <Button variant="outline" asChild>
                <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer">
                  Manage Google Security
                </a>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 8 characters)"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={changingPassword}>
                {changingPassword && <Loader2 size={14} className="animate-spin mr-2" />}
                Update Password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone size={18} className="text-primary" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-3">
                {twoFactorEnabled ? (
                  <CheckCircle size={20} className="text-green-600" />
                ) : (
                  <AlertCircle size={20} className="text-amber-600" />
                )}
                <div>
                  <p className="font-medium">
                    {twoFactorEnabled ? "Enabled" : "Disabled"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {twoFactorEnabled
                      ? "Your account is protected with 2FA"
                      : "Secure your account with 2FA"}
                  </p>
                </div>
              </div>
              <Button
                variant={twoFactorEnabled ? "outline" : "default"}
                onClick={twoFactorEnabled ? handleDisable2FA : start2FASetup}
                disabled={setupLoading}
              >
                {setupLoading && <Loader2 size={14} className="animate-spin mr-2" />}
                {twoFactorEnabled ? "Disable" : "Enable"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key size={18} className="text-primary" />
                Active Sessions
              </CardTitle>
              <CardDescription>Manage your active sessions and devices</CardDescription>
            </div>
            {sessions.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRevokeAllSessions}
                disabled={revoking === "all"}
              >
                {revoking === "all" && <Loader2 size={14} className="animate-spin mr-1" />}
                Revoke All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingSessions ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="animate-spin text-primary" size={24} />
              <p className="text-sm text-muted-foreground">Loading active sessions...</p>
            </div>
          ) : sessions.length > 0 ? (
            <>
              {paginatedSessions.map((session, idx) => {
                const globalIdx = (sessionsPage - 1) * SESSIONS_PER_PAGE + idx;
                const isCurrent = globalIdx === sessions.length - 1;
                return (
                  <div
                    key={session.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{parseUserAgent(session?.userAgent)}</p>
                      <p className="text-xs text-muted-foreground">IP: {session.ipAddress || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">
                        Started: {new Date(session.createdAt).toLocaleString()}
                      </p>
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
              {sessionsTotalPages > 1 && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    {(sessionsPage - 1) * SESSIONS_PER_PAGE + 1}–{Math.min(sessionsPage * SESSIONS_PER_PAGE, sessions.length)} of {sessions.length} sessions
                  </p>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setSessionsPage(p => Math.max(1, p - 1))} disabled={sessionsPage === 1}>
                      <ChevronLeft size={14} />
                    </Button>
                    <span className="text-xs text-muted-foreground px-2">{sessionsPage} / {sessionsTotalPages}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setSessionsPage(p => Math.min(sessionsTotalPages, p + 1))} disabled={sessionsPage === sessionsTotalPages}>
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

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={18} className="text-primary" />
            Connected Accounts
          </CardTitle>
          <CardDescription>Manage your connected authentication methods</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {user.googleId && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Google Account</p>
                <p className="text-xs text-muted-foreground">Connected and active</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
          )}
          {!user.googleId && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No additional accounts connected
            </p>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle size={18} />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-red-100 rounded-lg bg-white">
            <div className="space-y-0.5">
              <p className="font-medium text-gray-900">Delete Account</p>
              <p className="text-xs text-muted-foreground">
                Permanently remove your account and all associated data. This requires admin approval.
              </p>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setDeleteOpen(true)}
              disabled={user.status === 'pending_deletion'}
            >
              {user.status === 'pending_deletion' ? "Deletion Pending" : "Delete Account"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Deletion Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action will submit a request to delete your account. Once an administrator approves it, all your data will be permanently removed. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting && <Loader2 size={14} className="animate-spin mr-1" />}
              Request Account Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Session Dialog */}
      <Dialog open={!!revokeOpen} onOpenChange={() => setRevokeOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this session? You&apos;ll need to sign in again on that device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeOpen(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => revokeOpen && handleRevokeSession(revokeOpen)}
              disabled={revoking === revokeOpen}
            >
              {revoking === revokeOpen && <Loader2 size={14} className="animate-spin mr-1" />}
              Revoke Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Setup Dialog */}
      <Dialog open={showingTwoFactorSetup} onOpenChange={setShowingTwoFactorSetup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enhance your account security by requiring a verification code on sign-in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Scan this QR code with an authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
              </p>
              <div className="bg-white p-4 rounded inline-block">
                {qrCode ? (
                  <img src={qrCode} alt="2FA QR Code" className="w-40 h-40" />
                ) : (
                  <div className="w-40 h-40 bg-muted flex items-center justify-center rounded">
                    <Loader2 size={24} className="animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="verification-code">Enter verification code</Label>
              <Input
                id="verification-code"
                placeholder="000000"
                maxLength={6}
                value={setupToken}
                onChange={(e) => setSetupToken(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowingTwoFactorSetup(false)}>
              Cancel
            </Button>
            <Button onClick={verifyAndEnable2FA} disabled={setupLoading || setupToken.length !== 6}>
              {setupLoading && <Loader2 size={14} className="animate-spin mr-2" />}
              Verify & Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
