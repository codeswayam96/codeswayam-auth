"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Globe, Palette, Download, Loader2, UserX, AlertTriangle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { fetchPreferences, updatePreferences, apiFetch, type UserPreferences } from "@/lib/api";
import { useAccount } from "../layout";

export default function PreferencesPage() {
  const { user } = useAccount();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences()
      .then(setPrefs)
      .catch(() => toast.error("Failed to load preferences"))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (data: Partial<UserPreferences>) => {
    if (!prefs) return;
    
    // Optimistic update
    const prev = { ...prefs };
    setPrefs({ ...prefs, ...data });

    try {
      await updatePreferences(data);
    } catch (err: any) {
      setPrefs(prev);
      toast.error("Failed to update preference");
    }
  };

  const handleSaveAll = async () => {
    if (!prefs) return;
    setSaving(true);
    try {
      await updatePreferences(prefs);
      toast.success("Preferences saved successfully");
    } catch (err: any) {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleDataExport = async () => {
    try {
      const data = await apiFetch("/users/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `codeswayam-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Your data has been exported successfully");
    } catch (err: any) {
      toast.error("Failed to export data");
    }
  };

  const [deleteLoading, setDeleteLoading] = useState(false);
  const handleDeleteRequest = async () => {
    if (!confirm("Are you sure you want to delete your account? This will initiate a 14-day pending period before permanent deletion.")) return;
    
    setDeleteLoading(true);
    try {
      await apiFetch("/users/account", { method: "DELETE" });
      toast.success("Account deletion request submitted. You will be logged out shortly.");
      setTimeout(() => window.location.href = "/", 3000);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit deletion request");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!prefs) return null;

  return (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={18} className="text-primary" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-xs text-muted-foreground">
                Receive important updates and announcements via email
              </p>
            </div>
            <Switch
              checked={prefs.emailNotifications}
              onCheckedChange={(val) => handleUpdate({ emailNotifications: val })}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Billing Alerts</p>
              <p className="text-xs text-muted-foreground">
                Get notified about upcoming charges and payment issues
              </p>
            </div>
            <Switch
              checked={prefs.billingAlerts}
              onCheckedChange={(val) => handleUpdate({ billingAlerts: val })}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Security Alerts</p>
              <p className="text-xs text-muted-foreground">
                Get notified about unusual account activity and login attempts
              </p>
            </div>
            <Switch
              checked={prefs.securityAlerts}
              onCheckedChange={(val) => handleUpdate({ securityAlerts: val })}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Product Updates</p>
              <p className="text-xs text-muted-foreground">
                Learn about new features and product improvements
              </p>
            </div>
            <Switch
              checked={prefs.productUpdates}
              onCheckedChange={(val) => handleUpdate({ productUpdates: val })}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Newsletter</p>
              <p className="text-xs text-muted-foreground">
                Subscribe to our newsletter for tips and best practices
              </p>
            </div>
            <Switch
              checked={prefs.newsletter}
              onCheckedChange={(val) => handleUpdate({ newsletter: val })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language & Localization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe size={18} className="text-primary" />
            Language & Localization
          </CardTitle>
          <CardDescription>Customize your regional settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              value={prefs.language}
              onChange={(e) => handleUpdate({ language: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
              <option value="zh">Chinese</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <select
              id="timezone"
              value={prefs.timezone}
              onChange={(e) => handleUpdate({ timezone: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time (EST)</option>
              <option value="CST">Central Time (CST)</option>
              <option value="MST">Mountain Time (MST)</option>
              <option value="PST">Pacific Time (PST)</option>
              <option value="GMT">GMT (London)</option>
              <option value="CET">Central European Time (CET)</option>
              <option value="IST">Indian Standard Time (IST)</option>
              <option value="SGT">Singapore Time (SGT)</option>
              <option value="JST">Japan Standard Time (JST)</option>
              <option value="AEST">Australian Eastern (AEST)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette size={18} className="text-primary" />
            Theme Settings
          </CardTitle>
          <CardDescription>Customize your appearance preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <select
              id="theme"
              value={prefs.theme}
              onChange={(e) => handleUpdate({ theme: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System (Default)</option>
            </select>
            <p className="text-xs text-muted-foreground mt-2">
              Set to "System" to match your device preferences
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-violet-700">
            <Download size={18} />
            Data Management
          </CardTitle>
          <CardDescription>Export your account information for your records</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-violet-100 bg-violet-50/30 rounded-xl space-y-3">
            <div>
              <p className="font-bold text-sm text-violet-900">Export Your Data</p>
              <p className="text-[11px] text-violet-700/70 mt-1 leading-relaxed">
                Download a copy of your account data (JSON format), including profile information, 
                subscriptions, and activity logs for GDPR compliance.
              </p>
            </div>
            <Button onClick={handleDataExport} variant="outline" className="w-full border-violet-200 text-violet-700 hover:bg-violet-100/50 h-10 font-bold text-xs uppercase tracking-wider">
              <Download size={14} className="mr-2" />
              Download My Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-100 bg-red-50/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={18} />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-600/60">Permanently remove your account and data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-red-200 bg-white rounded-xl space-y-3">
            <div>
              <p className="font-bold text-sm text-red-900">Delete Account</p>
              <p className="text-[11px] text-red-700/70 mt-1 leading-relaxed">
                Once requested, your account will enter a 14-day pending period. After approval, 
                all your data will be permanently wiped. This action cannot be undone.
              </p>
            </div>

            {user?.rejectionReason && user.status === 'active' && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-100 text-red-800 text-[11px] leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <p>
                  <span className="font-bold">Deletion Rejected:</span> {user.rejectionReason}
                </p>
              </div>
            )}
            <Button 
              onClick={handleDeleteRequest} 
              variant="destructive" 
              className="w-full bg-red-600 hover:bg-red-700 h-10 font-bold text-xs uppercase tracking-wider"
              disabled={deleteLoading}
            >
              <UserX size={14} className="mr-2" />
              {deleteLoading ? "Processing..." : "Initiate Account Deletion"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-2 justify-end sticky bottom-0 bg-background/80 backdrop-blur border-t py-4 px-6 -mx-6">
        <Button variant="outline" onClick={() => fetchPreferences().then(setPrefs)}>Reset Changes</Button>
        <Button onClick={handleSaveAll} disabled={saving}>
          {saving && <Loader2 size={14} className="animate-spin mr-2" />}
          Save All Preferences
        </Button>
      </div>
    </div>
  );
}

