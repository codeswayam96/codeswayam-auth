import React from "react";
import Link from "next/link";
import { Download, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Invoice } from "@/lib/api";
import { StatusBadge } from "./StatusBadge";

export function formatCurrency(amount: number, currency: string) {
  if (!amount) return currency === "INR" ? "₹0" : "$0";
  const val = amount / 100;
  return currency === "INR"
    ? `₹${val.toLocaleString("en-IN")}`
    : `$${val.toLocaleString("en-US")}`;
}

export function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function InvoiceRow({ invoice }: { invoice: Invoice }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center shrink-0">
          <Receipt size={15} className="text-violet-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">
            {invoice.productName || invoice.description}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {invoice.invoiceNumber} · {formatDate(invoice.createdAt)}
            {invoice.billingCycle && (
              <span className="ml-1 capitalize">· {invoice.billingCycle}</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 shrink-0">
        <div className="text-right">
          <p className="text-sm font-bold">
            {formatCurrency(invoice.amount, invoice.currency)}
          </p>
          {invoice.periodEnd && (
            <p className="text-[10px] text-muted-foreground hidden sm:block">
              Until{" "}
              {new Date(invoice.periodEnd).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={invoice.status} />
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 sm:w-auto p-0 sm:px-2.5 text-xs gap-1"
            asChild
          >
            <Link href={`/invoices/${invoice.id}`} target="_blank" title="Download PDF">
              <Download size={11} /> <span className="hidden sm:inline">PDF</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
