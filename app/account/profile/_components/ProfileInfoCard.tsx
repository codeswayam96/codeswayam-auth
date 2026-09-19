"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, Shield, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "@/lib/api";
import type { AvatarUploadProps } from "./AvatarUpload";
import { AvatarUpload } from "./AvatarUpload";

const ROLE_COLORS: Record<string, string> = {
  superadmin: "bg-violet-100 text-violet-700",
  admin:      "bg-cyan-100 text-cyan-700",
  editor:     "bg-blue-100 text-blue-700",
  viewer:     "bg-gray-100 text-gray-700",
  subscriber: "bg-purple-100 text-purple-700",
  user:       "bg-slate-100 text-slate-700",
};

interface ProfileInfoCardProps {
  user: any;
  onUserUpdate: (updated: any) => void;
}

/**
 * ProfileInfoCard — displays and allows editing of name, email, role, account type, and member since.
 * Avatar upload is handled by the nested AvatarUpload component.
 */
export function ProfileInfoCard({ user, onUserUpdate }: ProfileInfoCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(user.name ?? "");
  const [saving, setSaving]   = useState(false);

  const accountType = user.googleId ? "Google OAuth" : "Email & Password";
  const rc = ROLE_COLORS[user.role] ?? ROLE_COLORS.user;
  const displayName = user.name || user.email.split("@")[0];
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile({ name: name.trim() });
      onUserUpdate(updated);
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to update profile");
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Manage your personal details and account information</CardDescription>
          </div>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => { setName(user.name ?? ""); setEditing(true); }}>
              <Pencil size={14} className="mr-1" /> Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <AvatarUpload initials={initials} avatarUrl={(user as any).avatarUrl} onUpdate={onUserUpdate} />
          <div className="flex-1">
            {editing ? (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="w-full max-w-sm" />
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
              {saving && <Loader2 size={14} className="animate-spin mr-1" />} Save Changes
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        )}

        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: <Mail size={16} />, label: "Email", value: user.email },
            { icon: <Shield size={16} />, label: "Role", value: null, roleValue: user.role, rc },
            { icon: <User size={16} />, label: "Account Type", value: accountType },
            {
              icon: <Calendar size={16} />,
              label: "Member Since",
              value: user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                : "—",
            },
          ].map(({ icon, label, value, roleValue, rc: roleClass }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">{icon}</div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
                {roleValue ? (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-0.5 ${roleClass}`}>{roleValue}</span>
                ) : (
                  <p className="text-sm font-medium mt-0.5">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Re-export for convenience — AvatarUploadProps used by parent
export type { AvatarUploadProps };
