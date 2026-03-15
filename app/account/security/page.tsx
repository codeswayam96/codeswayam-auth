"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Shield, Lock, Eye, EyeOff, Loader2, Key, Smartphone, LogOut, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useAccount } from "../layout";

interface Session {
  id: string;
  device: string;
  location: string;
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

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showingTwoFactorSetup, setShowingTwoFactorSetup] = useState(false);

  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "1",
      device: "Chrome on Windows",
      location: "San Francisco, CA",
      ipAddress: "192.168.1.1",
      lastActive: new Date().toISOString(),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const [revokeOpen, setRevokeOpen] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
      const res = await fetch(`${apiUrl}/users/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to change password");
      }

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

  const handleRevokeSession = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSessions([]);
      toast.success("All sessions revoked successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke sessions");
    } finally {
      setRevoking(null);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Password Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock size={18} className="text-primary" />
            Change Password
          </CardTitle>
          <CardDescription>Update your password to secure your account</CardDescription>
        </CardHeader>
        <CardContent>
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
                onClick={() => setShowingTwoFactorSetup(true)}
              >
                {twoFactorEnabled ? "Manage" : "Enable"}
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
          {sessions.length > 0 ? (
            sessions.map((session, idx) => (
              <div
                key={session.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium">{session.device}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.location} • IP: {session.ipAddress}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last active: {new Date(session.lastActive).toLocaleString()}
                  </p>
                  {idx === 0 && <Badge className="mt-2">Current</Badge>}
                </div>
                {idx !== 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRevokeOpen(session.id)}
                  >
                    <LogOut size={14} />
                  </Button>
                )}
              </div>
            ))
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
          {user.clerkId && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Clerk Account</p>
                <p className="text-xs text-muted-foreground">Connected and active</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
          )}
          {!user.googleId && !user.clerkId && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No additional accounts connected
            </p>
          )}
        </CardContent>
      </Card>

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
                <div className="w-40 h-40 bg-muted flex items-center justify-center rounded">
                  <span className="text-xs text-muted-foreground">QR Code Placeholder</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="backup-code">Enter verification code</Label>
              <Input
                id="backup-code"
                placeholder="000000"
                maxLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowingTwoFactorSetup(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setTwoFactorEnabled(true);
              setShowingTwoFactorSetup(false);
              toast.success("Two-factor authentication enabled");
            }}>
              Enable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
