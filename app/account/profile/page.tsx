"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  User, Mail, Calendar, Shield, Pencil, Loader2, Trash2, AlertTriangle,
  CreditCard, Crown, Zap, Package, ArrowRight, TrendingUp, Layers, Camera,
} from "lucide-react";
import { toast } from "sonner";
import { updateProfile, deleteAccount, logout, fetchUserSubscriptions } from "@/lib/api";
import type { UserSubscription } from "@/lib/api";
import { useAccount } from "../layout";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandLoader } from "@/components/brand-loader";

const roleColors: Record<string, string> = {
  superadmin: "bg-violet-100 text-violet-700",
  admin:      "bg-cyan-100 text-cyan-700",
  editor:     "bg-blue-100 text-blue-700",
  viewer:     "bg-gray-100 text-gray-700",
  subscriber: "bg-purple-100 text-purple-700",
  user:       "bg-slate-100 text-slate-700",
};

function formatAmount(amount: number, currency: string) {
  if (!amount) return "Free";
  const val = amount / 100;
  return currency === "INR"
    ? `₹${val.toLocaleString("en-IN")}`
    : `$${val.toLocaleString("en-US")}`;
}

// ─── Subscription Summary Widget ──────────────────────────────────────────────

function SubscriptionSummary() {
  const [subs, setSubs] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserSubscriptions()
      .then((data: any) => setSubs(Array.isArray(data) ? data : (data?.subscriptions || [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active = subs.filter((s) => s.status === "active");
  const totalMonthly = active.reduce((sum, s) => {
    const mo = s.billingCycle === "yearly" ? Math.round(s.amount / 12) : s.amount;
    return sum + mo;
  }, 0);
  const hasBundles = active.some((s) => !!s.bundleId);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <BrandLoader size="sm" text="Syncing plans..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={14} className="text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
          </div>
          <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs text-muted-foreground">
            <Link href="/account/subscriptions">
              Manage <ArrowRight size={10} className="ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-3 space-y-3">
        {active.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 flex flex-col items-center text-center gap-3">
            <Package size={24} className="text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No active subscriptions yet.</p>
            <Button size="sm" asChild>
              <Link href="/dashboard">
                <Zap size={12} className="mr-1.5" /> Browse Products
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Subscription list */}
            <div className="space-y-1.5">
              {active.slice(0, 3).map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between rounded-md border border-border/50 bg-muted/30 px-3 py-2.5 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-background border border-border/60 flex items-center justify-center shrink-0">
                      {sub.bundleId ? (
                        <Layers size={13} className="text-muted-foreground" />
                      ) : (
                        <Zap size={13} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {sub.productName || sub.bundleName || "Plan"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground capitalize">
                        {sub.billingCycle} · {formatAmount(sub.amount, sub.currency)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full shrink-0">
                    Active
                  </span>
                </div>
              ))}

              {active.length > 3 && (
                <p className="text-xs text-muted-foreground text-center pt-0.5">
                  +{active.length - 3} more ·{" "}
                  <Link href="/account/subscriptions" className="text-primary hover:underline">
                    view all
                  </Link>
                </p>
              )}
            </div>

            {/* Footer: spend + actions */}
            <div className="flex items-center justify-between pt-1 border-t border-border/40">
              <div>
                <p className="text-xs text-muted-foreground">
                  Monthly spend
                </p>
                <p className="text-2xl font-bold leading-none mt-0.5">
                  {formatAmount(totalMonthly, "INR")}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {hasBundles && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground border border-border/60 px-2 py-1 rounded-full">
                    <Crown size={9} /> Bundle
                  </span>
                )}
                <Button variant="outline" size="sm" className="h-8 text-[11px] sm:text-xs px-2 sm:px-3" asChild>
                  <Link href="/account/subscriptions">
                    <TrendingUp size={11} className="mr-1" /> Upgrade
                  </Link>
                </Button>
                <Button size="sm" className="h-8 text-[11px] sm:text-xs px-2 sm:px-3" asChild>
                  <Link href="/dashboard">
                    <Package size={11} className="mr-1" /> Add
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
// ─── Main Profile Page ────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, setUser } = useAccount();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Avatar upload state
  const [avatarPreview, setAvatarPreview] = useState<string | null>((user as any)?.avatarUrl ?? null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }

    // Show instant preview
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploadingAvatar(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      const updated = await updateProfile({ avatarUrl: base64 } as any);
      setUser(updated?.data ?? updated);
      toast.success("Profile photo updated!");
    } catch {
      toast.error("Failed to upload photo — please try again");
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile({ name: name.trim() });
      setUser(updated);
      setEditing(false);
      toast.success("Profile updated successfully");
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
      toast.success("Account deleted successfully");
      router.push("/login");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete account");
    }
    setDeleting(false);
  };

  const accountType = user.googleId ? "Google OAuth" : "Email & Password";
  const rc = roleColors[user.role] || roleColors.user;
  const displayName = user.name || user.email.split("@")[0];
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6">
      {/* ── Profile Card ── */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your personal details and account information</CardDescription>
            </div>
            {!editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setName(user.name || ""); setEditing(true); }}
              >
                <Pencil size={14} className="mr-1" /> Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            {/* Clickable avatar with upload overlay */}
            <div className="relative group shrink-0">
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center text-xl font-bold text-primary">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploadingAvatar
                    ? <Loader2 size={16} className="animate-spin text-white" />
                    : <Camera size={16} className="text-white" />}
                </div>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
              />
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full max-w-sm"
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
                {saving && <Loader2 size={14} className="animate-spin mr-1" />}
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
                <p className="text-xs text-muted-foreground font-medium">Email</p>
                <p className="text-sm font-medium mt-0.5">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Shield size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Role</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-0.5 ${rc}`}>
                  {user.role}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <User size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Account Type</p>
                <p className="text-sm font-medium mt-0.5">{accountType}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Calendar size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Member Since</p>
                <p className="text-sm font-medium mt-0.5">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Subscription Summary ── */}
      <SubscriptionSummary />

      {/* ── Account Status ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your account is currently {user.status || "active"}
              </p>
            </div>
            <Badge
              variant={
                user.status === "active" || !user.status
                  ? "default"
                  : user.status === "suspended"
                  ? "destructive"
                  : "secondary"
              }
            >
              {(user.status || "active").charAt(0).toUpperCase() + (user.status || "active").slice(1)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* ── Danger Zone ── */}
      <Card className="border-red-200/50 bg-red-50/30">
        <CardHeader>
          <CardTitle className="text-base text-red-700">Danger Zone</CardTitle>
          <CardDescription className="text-red-600">Irreversible actions for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={14} className="mr-1" /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Delete Dialog ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-600" /> Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data, sessions, and preferences will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 size={14} className="animate-spin mr-1" />}
              Yes, Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
