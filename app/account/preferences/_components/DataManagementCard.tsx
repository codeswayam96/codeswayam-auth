import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DataManagementCardProps {
  onExport: () => void;
}

export function DataManagementCard({ onExport }: DataManagementCardProps) {
  return (
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
          <Button
            onClick={onExport}
            variant="outline"
            className="w-full border-violet-200 text-violet-700 hover:bg-violet-100/50 h-10 font-bold text-xs uppercase tracking-wider"
          >
            <Download size={14} className="mr-2" />
            Download My Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
