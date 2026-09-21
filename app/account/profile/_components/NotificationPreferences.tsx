"use client";

import { useEffect, useState } from "react";
import { Bell, Mail, Shield, CreditCard, Sparkles, Tag, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useWebPush } from "@codeswayam/ui";

interface PreferenceItem {
  category: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
}

const CATEGORY_META: Record<
  string,
  { label: string; description: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  billing: {
    label: "Billing & Invoices",
    description: "Invoices, subscription renewals, cancellation & refund notices",
    icon: CreditCard,
  },
  security: {
    label: "Security & Login",
    description: "New sign-ins, password updates, and account security alerts",
    icon: Shield,
  },
  updates: {
    label: "Product & AI Updates",
    description: "New AI models, platform feature releases, background job completions",
    icon: Sparkles,
  },
  marketing: {
    label: "Offers & Promotions",
    description: "Special discounts, referral credit updates, and seasonal campaigns",
    icon: Tag,
  },
};

export function NotificationPreferences() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const [preferences, setPreferences] = useState<PreferenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { isSupported, isSubscribed, permission, loading: pushLoading, subscribe, unsubscribe } = useWebPush({
    apiUrl,
  });

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/notifications/preferences`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setPreferences(data);
      }
    } catch {
      toast.error("Failed to load notification preferences");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const handleToggle = (category: string, channel: "email" | "push", value: boolean) => {
    setPreferences((prev) =>
      prev.map((item) =>
        item.category === category
          ? {
              ...item,
              [channel === "email" ? "emailEnabled" : "pushEnabled"]: value,
            }
          : item,
      ),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/notifications/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(preferences),
      });

      if (res.ok) {
        toast.success("Notification preferences saved successfully!");
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to save notification preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card id="notifications" className="border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Bell className="text-violet-600" size={20} />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Choose how you want to be notified across email and browser push.
            </CardDescription>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || loading}
            size="sm"
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {saving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Check size={14} className="mr-1.5" />}
            Save Changes
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Browser Push Registration Banner */}
        {isSupported && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-violet-100 bg-violet-50/40">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-violet-950 flex items-center gap-1.5">
                <Bell size={14} className="text-violet-600" />
                Browser Web Push Notifications
              </p>
              <p className="text-[11px] text-violet-800/80">
                {isSubscribed
                  ? "✓ Push notifications are active on this browser."
                  : permission === "denied"
                    ? "Notifications are blocked in your browser settings."
                    : "Enable instant alerts on your desktop or mobile even when the app is closed."}
              </p>
            </div>

            {permission !== "denied" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={isSubscribed ? unsubscribe : subscribe}
                disabled={pushLoading}
                className="shrink-0 text-xs border-violet-200 hover:bg-violet-100/60"
              >
                {pushLoading ? (
                  <Loader2 size={13} className="animate-spin mr-1" />
                ) : isSubscribed ? (
                  "Disable Push on this Device"
                ) : (
                  "Enable Browser Push"
                )}
              </Button>
            )}
          </div>
        )}

        {/* Preference Matrix */}
        {loading ? (
          <div className="flex justify-center py-8 text-violet-600">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-gray-100 border rounded-xl overflow-hidden bg-white">
            <div className="grid grid-cols-12 px-4 py-2.5 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-8 sm:col-span-8">Category</div>
              <div className="col-span-2 text-center flex items-center justify-center gap-1">
                <Mail size={12} /> Email
              </div>
              <div className="col-span-2 text-center flex items-center justify-center gap-1">
                <Bell size={12} /> Push
              </div>
            </div>

            {preferences.map((item) => {
              const meta = CATEGORY_META[item.category] || {
                label: item.category,
                description: "Notifications for this category",
                icon: Bell,
              };
              const Icon = meta.icon;

              return (
                <div
                  key={item.category}
                  className="grid grid-cols-12 items-center px-4 py-3.5 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="col-span-8 sm:col-span-8 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 text-gray-600 shrink-0 mt-0.5">
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 leading-none">{meta.label}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">{meta.description}</p>
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-center">
                    <Switch
                      checked={item.emailEnabled}
                      onCheckedChange={(v) => handleToggle(item.category, "email", v)}
                    />
                  </div>

                  <div className="col-span-2 flex justify-center">
                    <Switch
                      checked={item.pushEnabled}
                      onCheckedChange={(v) => handleToggle(item.category, "push", v)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
