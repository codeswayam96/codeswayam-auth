"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Eye, EyeOff, Lock, Loader2, Shield, XCircle } from "lucide-react";
import { toast } from "sonner";
import { changePassword } from "@/lib/api";

// ─── Password Strength Internals ──────────────────────────────────────────────

interface PasswordRule { label: string; test: (p: string) => boolean }

const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 8 characters",     test: (p) => p.length >= 8 },
  { label: "Uppercase letter (A–Z)",     test: (p) => /[A-Z]/.test(p) },
  { label: "Lowercase letter (a–z)",     test: (p) => /[a-z]/.test(p) },
  { label: "Number (0–9)",               test: (p) => /\d/.test(p) },
  { label: "Special character (!@#$…)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const STRENGTH_CFG = [
  { label: "Very Weak",  color: "bg-red-500",     text: "text-red-600"    },
  { label: "Weak",       color: "bg-orange-500",  text: "text-orange-600" },
  { label: "Fair",       color: "bg-amber-500",   text: "text-amber-600"  },
  { label: "Strong",     color: "bg-blue-500",    text: "text-blue-600"   },
  { label: "Very Strong",color: "bg-emerald-500", text: "text-emerald-600"},
];

function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const cfg = STRENGTH_CFG[Math.min(passed, 4)];
  return (
    <div className="mt-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < passed ? cfg.color : "bg-gray-200"}`} />
          ))}
        </div>
        <span className={`text-[11px] font-bold ${cfg.text} whitespace-nowrap`}>{cfg.label}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <div key={rule.label} className={`flex items-center gap-1.5 text-[11px] font-medium ${ok ? "text-emerald-700" : "text-gray-400"}`}>
              {ok
                ? <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                : <XCircle size={11} className="text-gray-300 shrink-0" />}
              {rule.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Password Field with visibility toggle ───────────────────────────────────

function PasswordField({ id, label, value, onChange, placeholder }: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required />
        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShow(!show)}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

interface PasswordSectionProps {
  isGoogleUser: boolean;
}

/**
 * PasswordSection — change password form with real-time strength meter.
 * Hidden for Google OAuth users with a helpful redirect.
 */
export function PasswordSection({ isGoogleUser }: PasswordSectionProps) {
  const [current, setCurrent]   = useState("");
  const [newPw, setNewPw]       = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirm) { toast.error("Passwords do not match"); return; }
    if (newPw.length < 8)  { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await changePassword(current, newPw);
      toast.success("Password changed successfully");
      setCurrent(""); setNewPw(""); setConfirm("");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Lock size={18} className="text-primary" /> Change Password</CardTitle>
        <CardDescription>
          {isGoogleUser ? "Your security is managed by Google" : "Update your password to secure your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isGoogleUser ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <div className="p-3 bg-blue-50 rounded-full"><Shield size={32} className="text-blue-600" /></div>
            <div className="max-w-sm space-y-2">
              <p className="text-sm font-medium">You are signed in with Google</p>
              <p className="text-xs text-muted-foreground">
                Password management is handled by your Google account. Visit your Google Account settings to update it.
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer">Manage Google Security</a>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordField id="current-password" label="Current Password" value={current} onChange={setCurrent} placeholder="Enter current password" />
            <div className="space-y-2">
              <PasswordField id="new-password" label="New Password" value={newPw} onChange={setNewPw} placeholder="Enter new password (min 8 characters)" />
              <PasswordStrengthMeter password={newPw} />
            </div>
            <PasswordField id="confirm-password" label="Confirm Password" value={confirm} onChange={setConfirm} placeholder="Confirm new password" />
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 size={14} className="animate-spin mr-2" />} Update Password
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
