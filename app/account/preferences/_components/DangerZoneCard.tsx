import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, UserX } from "lucide-react";

interface DangerZoneCardProps {
  user: any;
  deleteLoading: boolean;
  onDeleteRequest: () => void;
}

export function DangerZoneCard({
  user,
  deleteLoading,
  onDeleteRequest,
}: DangerZoneCardProps) {
  return (
    <Card className="border-red-100 bg-red-50/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle size={18} />
          Danger Zone
        </CardTitle>
        <CardDescription className="text-red-600/60">
          Permanently remove your account and data
        </CardDescription>
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

          {user?.rejectionReason && user.status === "active" && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-100 text-red-800 text-[11px] leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <p>
                <span className="font-bold">Deletion Rejected:</span> {user.rejectionReason}
              </p>
            </div>
          )}
          <Button
            onClick={onDeleteRequest}
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
  );
}
