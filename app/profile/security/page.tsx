"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock, Eye, EyeOff, Shield, Loader2, KeyRound, Globe } from "lucide-react";
import { toast } from "sonner";
import { changePassword } from "@/lib/api";
import { useProfile } from "../layout";

export default function SecurityPage() {
  const { user } = useProfile();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!user) return null;

  const isOAuth = !!(user.googleId || user.clerkId);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      toast.error(e.message || "Failed to change password");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound size={18} /> Password
          </CardTitle>
          <CardDescription>
            {isOAuth
              ? "Your account uses external authentication"
              : "Change your password to keep your account secure"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isOAuth ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
              <Globe size={20} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  Signed in with {user.googleId ? "Google" : "Clerk"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Password management is handled by your {user.googleId ? "Google" : "Clerk"} account.
                  Visit your provider&apos;s settings to update your password.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="current">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowCurrent(!showCurrent)}
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new">New Password</Label>
                <div className="relative">
                  <Input
                    id="new"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={saving || !currentPassword || !newPassword || !confirmPassword}
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Update Password
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authentication Method */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield size={16} /> Authentication Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                {isOAuth ? <Globe size={16} /> : <Lock size={16} />}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {user.googleId ? "Google OAuth" : user.clerkId ? "Clerk SSO" : "Email & Password"}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Badge variant={isOAuth ? "info" : "secondary"}>
              {isOAuth ? "OAuth" : "Password"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Security Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              Use a strong, unique password that you don&apos;t use on other sites
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              Never share your password or authentication tokens with anyone
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              Sign out of shared devices when you&apos;re done
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              Review your account activity regularly for suspicious login attempts
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
