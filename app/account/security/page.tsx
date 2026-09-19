"use client";

/**
 * Security Page — orchestrator.
 * Security score widget is kept here since it depends on user context
 * and twoFactorEnabled state shared across sections.
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { deleteAccount } from "@/lib/api";
import { useAccount } from "../layout";
import { PasswordSection, TwoFactorSection, SessionsSection } from "./_components";

export default function SecurityPage() {
  const { user } = useAccount();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled ?? false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting]     = useState(false);

  useEffect(() => {
    if (user) setTwoFactorEnabled(user.twoFactorEnabled);
  }, [user]);

  if (!user) return null;

  const securityChecks = [
    { label: "Strong password set",       done: !user.googleId,         tip: "Set a password in Change Password below" },
    { label: "Email verified",             done: user.status === "active", tip: "Verify your email to unlock all features" },
    { label: "Two-factor authentication", done: twoFactorEnabled,        tip: "Enable 2FA above for +1 security point" },
    { label: "Google account linked",     done: !!user.googleId,         tip: "Connect Google for faster sign-in" },
  ];
  const score = securityChecks.filter((c) => c.done).length;
  const scoreColor  = score <= 1 ? "bg-red-500" : score === 2 ? "bg-amber-500" : score === 3 ? "bg-blue-500" : "bg-emerald-500";
  const scoreLabel  = score <= 1 ? "Poor"        : score === 2 ? "Fair"         : score === 3 ? "Good"         : "Excellent";

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      toast.success("Account deletion request submitted for admin approval");
      setDeleteOpen(false);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to request account deletion");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Security Score ── */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield size={18} className="text-primary" /> Security Score
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white ${scoreColor}`}>{scoreLabel}</span>
              <span className="text-2xl font-bold">{score}<span className="text-muted-foreground text-sm font-normal">/4</span></span>
            </div>
          </div>
          <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${scoreColor}`} style={{ width: `${(score / 4) * 100}%` }} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {securityChecks.map((check) => (
              <div
                key={check.label}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-sm ${check.done ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-secondary border-border text-muted-foreground"}`}
              >
                {check.done
                  ? <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                  : <AlertCircle size={14} className="text-amber-500 shrink-0" />}
                <span className="font-medium flex-1">{check.label}</span>
                {!check.done && <span className="text-[10px] opacity-60 hidden sm:block">{check.tip}</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <PasswordSection isGoogleUser={!!user.googleId} />
      <TwoFactorSection enabled={twoFactorEnabled} onStatusChange={setTwoFactorEnabled} />
      <SessionsSection />

      {/* ── Connected Accounts ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield size={18} className="text-primary" /> Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {user.googleId ? (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Google Account</p>
                <p className="text-xs text-muted-foreground">Connected and active</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No additional accounts connected</p>
          )}
        </CardContent>
      </Card>

      {/* ── Danger Zone ── */}
      <Card className="border-red-200 bg-red-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600"><AlertCircle size={18} /> Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-red-100 rounded-lg bg-white">
            <div className="space-y-0.5">
              <p className="font-medium text-gray-900">Delete Account</p>
              <p className="text-xs text-muted-foreground">
                Permanently remove your account and all associated data. This requires admin approval.
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)} disabled={user.status === "pending_deletion"}>
              {user.status === "pending_deletion" ? "Deletion Pending" : "Delete Account"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action will submit a request to delete your account. Once an administrator approves it, all your data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
              {deleting && <Loader2 size={14} className="animate-spin mr-1" />}
              Request Account Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
