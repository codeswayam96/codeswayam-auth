import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function BillingFaqCard() {
  return (
    <Card className="bg-blue-50/30 border-blue-200/50">
      <CardHeader>
        <CardTitle className="text-base text-blue-900">Billing Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-blue-900">❓ When will I be charged?</p>
          <p className="text-sm text-blue-800">
            You&apos;re charged at the time of purchase. Renewals happen on your subscription expiry date shown above.
          </p>
        </div>
        <Separator className="bg-blue-200/50" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-blue-900">❓ Where are my receipts?</p>
          <p className="text-sm text-blue-800">
            Each invoice above has a &ldquo;Receipt&rdquo; button. Click it to open a printable receipt page — use Ctrl+P to save as PDF.
          </p>
        </div>
        <Separator className="bg-blue-200/50" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-blue-900">❓ How do refunds work?</p>
          <p className="text-sm text-blue-800">
            Refunds are processed within 5-7 business days. Contact support with your invoice number.
          </p>
        </div>
        <Button variant="outline" className="w-full mt-4" asChild>
          <Link href="mailto:support@codeswayam.com">Contact Support</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
