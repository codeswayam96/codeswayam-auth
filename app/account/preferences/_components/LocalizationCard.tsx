import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Globe } from "lucide-react";
import type { UserPreferences } from "@/lib/api";

interface LocalizationCardProps {
  prefs: UserPreferences;
  onUpdate: (data: Partial<UserPreferences>) => void;
}

export function LocalizationCard({ prefs, onUpdate }: LocalizationCardProps) {
  return (
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
            onChange={(e) => onUpdate({ language: e.target.value })}
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
            onChange={(e) => onUpdate({ timezone: e.target.value })}
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
  );
}
