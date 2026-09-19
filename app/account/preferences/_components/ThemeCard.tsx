import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Palette } from "lucide-react";
import type { UserPreferences } from "@/lib/api";

interface ThemeCardProps {
  prefs: UserPreferences;
  onUpdate: (data: Partial<UserPreferences>) => void;
}

export function ThemeCard({ prefs, onUpdate }: ThemeCardProps) {
  return (
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
            onChange={(e) => onUpdate({ theme: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System (Default)</option>
          </select>
          <p className="text-xs text-muted-foreground mt-2">
            Set to &quot;System&quot; to match your device preferences
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
