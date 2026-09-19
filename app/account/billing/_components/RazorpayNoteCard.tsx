import React from "react";
import { CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function RazorpayNoteCard() {
  return (
    <Card className="border-blue-200/60 bg-blue-50/30">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
            <CreditCard size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">Payment via Razorpay</p>
            <p className="text-xs text-blue-700 mt-1">
              Your payments are securely processed through Razorpay. Card details are managed by Razorpay and never stored on our servers.
              Each payment generates an invoice below.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
