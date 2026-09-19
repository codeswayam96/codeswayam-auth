"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  fetchPreferences,
  updatePreferences,
  apiFetch,
  fetchVapidPublicKey,
  registerPushSubscription,
  unregisterPushSubscription,
  type UserPreferences,
} from "@/lib/api";
import { useAccount } from "../layout";
import { BrandLoader } from "@/components/brand-loader";
import {
  NotificationPreferencesCard,
  LocalizationCard,
  ThemeCard,
  DataManagementCard,
  DangerZoneCard,
} from "./_components";

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
      navigator.serviceWorker
        .register("/sw.js")
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
    const prev = { ...prefs };
    setPrefs({ ...prefs, ...data });

    try {
      await updatePreferences(data);
    } catch {
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
    } catch {
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
      a.download = `codeswayam-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Your data has been exported successfully");
    } catch {
      toast.error("Failed to export data");
    }
  };

  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
  }

  const handleTogglePush = async () => {
    setPushLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error(
          "Push notifications permission denied by the browser. Please reset permission settings for this site."
        );
      }

      const reg = await navigator.serviceWorker.ready;
      if (pushSubscribed) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await unregisterPushSubscription(sub.endpoint);
          await sub.unsubscribe();
        }
        setPushSubscribed(false);
        toast.success("Push notifications disabled");
      } else {
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
    if (
      !confirm(
        "Are you sure you want to delete your account? This will initiate a 14-day pending period before permanent deletion."
      )
    )
      return;

    setDeleteLoading(true);
    try {
      await apiFetch("/users/account", { method: "DELETE" });
      toast.success("Account deletion request submitted. You will be logged out shortly.");
      setTimeout(() => (window.location.href = "/"), 3000);
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
      <NotificationPreferencesCard
        prefs={prefs}
        onUpdate={handleUpdate}
        pushSupported={pushSupported}
        pushSubscribed={pushSubscribed}
        pushLoading={pushLoading}
        onTogglePush={handleTogglePush}
      />

      <LocalizationCard prefs={prefs} onUpdate={handleUpdate} />

      <ThemeCard prefs={prefs} onUpdate={handleUpdate} />

      <DataManagementCard onExport={handleDataExport} />

      <DangerZoneCard
        user={user}
        deleteLoading={deleteLoading}
        onDeleteRequest={handleDeleteRequest}
      />

      {/* Save Button */}
      <div className="flex gap-2 justify-end sticky bottom-0 bg-background/80 backdrop-blur border-t py-4 px-6 -mx-6">
        <Button variant="outline" onClick={() => fetchPreferences().then(setPrefs)}>
          Reset Changes
        </Button>
        <Button onClick={handleSaveAll} disabled={saving}>
          {saving && <Loader2 size={14} className="animate-spin mr-2" />}
          Save All Preferences
        </Button>
      </div>
    </div>
  );
}
