"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AccountStatusCardProps {
  status?: string;
}

/**
 * AccountStatusCard — displays the current account status with a badge.
 */
export function AccountStatusCard({ status = "active" }: AccountStatusCardProps) {
  const badgeVariant =
    status === "active"    ? "default"
    : status === "suspended" ? "destructive"
    : "secondary";

  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Account Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Status</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your account is currently {status}
            </p>
          </div>
          <Badge variant={badgeVariant}>{displayStatus}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
