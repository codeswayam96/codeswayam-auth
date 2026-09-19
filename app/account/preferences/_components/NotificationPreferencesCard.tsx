"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell, BellRing, BellOff, AlertCircle } from "lucide-react";
import type { UserPreferences } from "@/lib/api";

interface NotificationPreferencesCardProps {
  prefs: UserPreferences;
  onUpdate: (data: Partial<UserPreferences>) => void;
  pushSupported: boolean;
  pushSubscribed: boolean;
  pushLoading: boolean;
  onTogglePush: () => void;
}

export function NotificationPreferencesCard({
  prefs,
  onUpdate,
  pushSupported,
  pushSubscribed,
  pushLoading,
  onTogglePush,
}: NotificationPreferencesCardProps) {
  return (
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
            onCheckedChange={(val) => onUpdate({ emailNotifications: val })}
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
            onCheckedChange={(val) => onUpdate({ billingAlerts: val })}
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
            onCheckedChange={(val) => onUpdate({ securityAlerts: val })}
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
            onCheckedChange={(val) => onUpdate({ productUpdates: val })}
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
            onCheckedChange={(val) => onUpdate({ newsletter: val })}
          />
        </div>

        {/* Push Notifications row */}
        {pushSupported && (
          <div
            className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
              pushSubscribed ? "border-violet-200 bg-violet-50/40" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              {pushSubscribed ? (
                <BellRing size={16} className="mt-0.5 shrink-0 text-violet-600" />
              ) : (
                <BellOff size={16} className="mt-0.5 shrink-0 text-gray-400" />
              )}
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
              onClick={onTogglePush}
              disabled={pushLoading}
              className={`relative ml-4 shrink-0 inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors focus:outline-none disabled:opacity-60 ${
                pushSubscribed ? "bg-violet-600 border-violet-600" : "bg-gray-200 border-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  pushSubscribed ? "translate-x-5" : "translate-x-0.5"
                }`}
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
  );
}
