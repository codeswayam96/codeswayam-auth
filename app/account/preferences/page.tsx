"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Globe, Palette, Download, Loader2, UserX, AlertTriangle, AlertCircle, BellRing, BellOff } from "lucide-react";
import { toast } from "sonner";
import { fetchPreferences, updatePreferences, apiFetch, fetchVapidPublicKey, registerPushSubscription, unregisterPushSubscription, type UserPreferences } from "@/lib/api";
import { useAccount } from "../layout";
import { BrandLoader } from "@/components/brand-loader";

export default function PreferencesPage() {
  const { user } = useAccount();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Push Notifications state ──────────────────────────────────────────
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    fetchPreferences()
      .then(setPrefs)
      .catch(() => toast.error("Failed to load preferences"))
      .finally(() => setLoading(false));

    // Check push notification support & current subscription
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setPushSupported(true);
      // Register the service worker at mount to unlock navigator.serviceWorker.ready
      navigator.serviceWorker.register("/sw.js")
        .then(() => navigator.serviceWorker.ready)
        .then(async (reg) => {
          const existing = await reg.pushManager.getSubscription();
          setPushSubscribed(!!existing);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    }
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

  // ── Push Notification helpers ─────────────────────────────────────────
  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
  }

  const handleTogglePush = async () => {
    setPushLoading(true);
    try {
      // Explicitly request notification permission first
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Push notifications permission denied by the browser. Please reset permission settings for this site.");
      }

      const reg = await navigator.serviceWorker.ready;
      if (pushSubscribed) {
        // Unsubscribe
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await unregisterPushSubscription(sub.endpoint);
          await sub.unsubscribe();
        }
        setPushSubscribed(false);
        toast.success("Push notifications disabled");
      } else {
        // Subscribe
        const { publicKey } = await fetchVapidPublicKey();
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
        await registerPushSubscription(sub.toJSON() as PushSubscriptionJSON);
        setPushSubscribed(true);
        toast.success("Push notifications enabled!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update push notifications");
    } finally {
      setPushLoading(false);
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
    return <BrandLoader size="md" text="Syncing user preferences..." />;
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

          {/* Push Notifications row */}
          {pushSupported && (
            <div className={`flex items-center justify-between p-4 border rounded-lg transition-colors
              ${pushSubscribed ? "border-violet-200 bg-violet-50/40" : ""}`}>
              <div className="flex items-start gap-3">
                {pushSubscribed
                  ? <BellRing size={16} className="mt-0.5 shrink-0 text-violet-600" />
                  : <BellOff size={16} className="mt-0.5 shrink-0 text-gray-400" />}
                <div>
                  <p className="font-medium">
                    Browser Push Notifications
                    {pushSubscribed && (
                      <span className="ml-2 text-[10px] font-bold text-violet-700 bg-violet-100 border border-violet-200 px-1.5 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pushSubscribed
                      ? "You're receiving live alerts in your browser even when the tab is closed."
                      : "Get real-time alerts for payments, security events, and product updates — no tab needed."}
                  </p>
                </div>
              </div>
              <button
                onClick={handleTogglePush}
                disabled={pushLoading}
                className={`relative ml-4 shrink-0 inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors focus:outline-none disabled:opacity-60
                  ${pushSubscribed
                    ? "bg-violet-600 border-violet-600"
                    : "bg-gray-200 border-gray-200"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform
                    ${pushSubscribed ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </button>
            </div>
          )}

          {!pushSupported && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-xs">
              <AlertCircle size={13} className="shrink-0" />
              Browser push notifications are not supported in this environment.
            </div>
          )}
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

