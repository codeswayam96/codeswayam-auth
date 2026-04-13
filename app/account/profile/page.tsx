"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Button, Input, Label, Badge } from "@codeswayam/ui";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { User, Mail, Calendar, Shield, Pencil, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { updateProfile, deleteAccount, logout } from "@/lib/api";
import { useAccount } from "../layout";
import { useRouter } from "next/navigation";

const roleColors: Record<string, string> = {
  superadmin: "bg-violet-100 text-violet-700",
  admin: "bg-cyan-100 text-cyan-700",
  editor: "bg-blue-100 text-blue-700",
  viewer: "bg-gray-100 text-gray-700",
  subscriber: "bg-purple-100 text-purple-700",
  user: "bg-slate-100 text-slate-700",
};

export default function ProfilePage() {
  const { user, setUser } = useAccount();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const accountType = user.googleId ? "Google OAuth" : user.clerkId ? "Clerk" : "Email & Password";
  const rc = roleColors[user.role] || roleColors.user;

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your personal details and account information</CardDescription>
            </div>
            {!editing && (
              <Button variant="outline" size="sm" onClick={() => { setName(user.name || ""); setEditing(true); }}>
                <Pencil size={14} className="mr-1" /> Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 text-primary flex items-center justify-center text-xl font-bold">
              {(user.name || user.email)[0].toUpperCase()}
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
                <p className="text-sm font-medium mt-1">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Shield size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Role</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-1 ${rc}`}>
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
                <p className="text-sm font-medium mt-1">{accountType}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Calendar size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Member Since</p>
                <p className="text-sm font-medium mt-1">
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
              <p className="text-xs text-muted-foreground mt-1">Your account is currently {user.status || "active"}</p>
            </div>
            <Badge variant={user.status === "active" || !user.status ? "default" : user.status === "suspended" ? "destructive" : "secondary"}>
              {(user.status || "active").charAt(0).toUpperCase() + (user.status || "active").slice(1)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200/50 bg-red-50/30">
        <CardHeader>
          <CardTitle className="text-base text-red-700">Danger Zone</CardTitle>
          <CardDescription className="text-red-600">Irreversible actions for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-1">Permanently delete your account and all associated data</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={14} className="mr-1" /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-600" /> Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data, sessions, and preferences will be permanently removed from our systems.
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
