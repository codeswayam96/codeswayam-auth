"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { User, Mail, Calendar, Shield, Pencil, Loader2, Trash2, AlertTriangle, Zap, ExternalLink, Crown } from "lucide-react";
import { toast } from "sonner";
import { updateProfile, deleteAccount, logout, fetchUserSubscriptions } from "@/lib/api";
import { useProfile } from "./layout";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { UserSubscription } from "@/lib/api";

const roleColors: Record<string, string> = {
  superadmin: "bg-violet-100 text-violet-700",
  admin: "bg-cyan-100 text-cyan-700",
  editor: "bg-blue-100 text-blue-700",
  viewer: "bg-gray-100 text-gray-700",
  subscriber: "bg-purple-100 text-purple-700",
  user: "bg-slate-100 text-slate-700",
};

export default function AccountPage() {
  const { user, setUser } = useProfile();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [subsLoaded, setSubsLoaded] = useState(false);

  useEffect(() => {
    fetchUserSubscriptions()
      .then(setSubscriptions)
      .catch(() => {})
      .finally(() => setSubsLoaded(true));
  }, []);

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile({ name: name.trim() });
      setUser(updated);
      setEditing(false);
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      await logout();
      toast.success("Account deleted");
      router.push("/login");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete account");
    }
    setDeleting(false);
  };

  const accountType = user.googleId ? "Google" : "Email & Password";
  const rc = roleColors[user.role] || roleColors.user;

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your personal details and account info</CardDescription>
            </div>
            {!editing && (
              <Button variant="outline" size="sm" onClick={() => { setName(user.name || ""); setEditing(true); }}>
                <Pencil size={14} /> Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
              {(user.name || user.email)[0].toUpperCase()}
            </div>
            <div>
              {editing ? (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-64"
                  />
                </div>
              ) : (
                <>
                  <p className="text-lg font-semibold">{user.name || "Not set"}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </>
              )}
            </div>
          </div>

          {editing && (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving && <Loader2 size={14} className="animate-spin" />}
                Save Changes
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          )}

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Mail size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Shield size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${rc}`}>
                  {user.role}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <User size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Account Type</p>
                <p className="text-sm font-medium">{accountType}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Calendar size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="text-sm font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-xs text-muted-foreground">Your account is currently {user.status || "active"}</p>
            </div>
            <Badge variant={user.status === "active" || !user.status ? "success" : user.status === "suspended" ? "destructive" : "secondary"}>
              {(user.status || "active").charAt(0).toUpperCase() + (user.status || "active").slice(1)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Connected Apps / Subscriptions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Crown size={15} className="text-primary" /> Connected Apps
              </CardTitle>
              <CardDescription>Products you have access to</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile/subscription">Manage Plans</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!subsLoaded ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin" /> Loading subscriptions...
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-6">
              <Zap size={28} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No active subscriptions</p>
              <Button size="sm" variant="outline" className="mt-3" asChild>
                <Link href="/profile/subscription">Browse Plans</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {subscriptions.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{sub.productName || sub.bundleName || "Plan"}</p>
                      <p className="text-[11px] text-muted-foreground capitalize">{sub.billingCycle} · {sub.status}</p>
                    </div>
                  </div>
                  {sub.productDomain && (
                    <a
                      href={`https://${sub.productDomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      Open <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={14} /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-destructive" /> Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data, sessions, and preferences will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 size={14} className="animate-spin" />}
              Yes, Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
