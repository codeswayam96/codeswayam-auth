"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, Globe, Palette, Download, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function PreferencesPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [billingAlerts, setBillingAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [theme, setTheme] = useState("system");
  const [saving, setSaving] = useState(false);

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Preferences saved successfully");
    } catch (err: any) {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleDataExport = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Data export started. Check your email for the download link.");
    } catch (err: any) {
      toast.error("Failed to export data");
    }
  };

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
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Billing Alerts</p>
              <p className="text-xs text-muted-foreground">
                Get notified about upcoming charges and payment issues
              </p>
            </div>
            <Switch checked={billingAlerts} onCheckedChange={setBillingAlerts} />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Security Alerts</p>
              <p className="text-xs text-muted-foreground">
                Get notified about unusual account activity and login attempts
              </p>
            </div>
            <Switch checked={securityAlerts} onCheckedChange={setSecurityAlerts} />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Product Updates</p>
              <p className="text-xs text-muted-foreground">
                Learn about new features and product improvements
              </p>
            </div>
            <Switch checked={productUpdates} onCheckedChange={setProductUpdates} />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Newsletter</p>
              <p className="text-xs text-muted-foreground">
                Subscribe to our newsletter for tips and best practices
              </p>
            </div>
            <Switch checked={newsletter} onCheckedChange={setNewsletter} />
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
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
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
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
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
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
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
          <CardTitle className="flex items-center gap-2">
            <Download size={18} className="text-primary" />
            Data Management
          </CardTitle>
          <CardDescription>Export and manage your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg space-y-3">
            <div>
              <p className="font-medium">Export Your Data</p>
              <p className="text-xs text-muted-foreground mt-1">
                Download a copy of your account data, including profile information, subscriptions, and activity logs. The export will be sent to your email address.
              </p>
            </div>
            <Button onClick={handleDataExport} variant="outline" className="w-full">
              <Download size={14} className="mr-2" />
              Request Data Export
            </Button>
          </div>

          <div className="p-4 bg-red-50/30 border border-red-200/50 rounded-lg space-y-3">
            <div>
              <p className="font-medium text-red-900">Delete All Data</p>
              <p className="text-xs text-red-700 mt-1">
                Permanently delete all your data. This action cannot be undone.
              </p>
            </div>
            <Button variant="destructive" className="w-full">
              Delete All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-2 justify-end sticky bottom-0 bg-background border-t py-4">
        <Button variant="outline">Reset to Defaults</Button>
        <Button onClick={handleSavePreferences} disabled={saving}>
          {saving && <Loader2 size={14} className="animate-spin mr-2" />}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

