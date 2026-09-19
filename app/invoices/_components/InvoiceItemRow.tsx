import React from "react";
import Link from "next/link";
import { Receipt, Calendar, ExternalLink } from "lucide-react";
import type { Invoice } from "@/lib/api";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

export function formatAmount(amount: number, currency: string) {
  if (!amount) return "Free";
  const val = amount / 100;
  return currency === "INR"
    ? `₹${val.toLocaleString("en-IN")}`
    : `$${val.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatPeriod(start?: string, end?: string) {
  if (!start || !end) return null;
  const s = new Date(start).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const e = new Date(end).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${s} – ${e}`;
}

export function InvoiceItemRow({ invoice, isLast }: { invoice: Invoice; isLast: boolean }) {
  const period = formatPeriod(invoice.periodStart ?? undefined, invoice.periodEnd ?? undefined);

  return (
    <div
      className={`group flex items-center gap-4 px-5 py-4 hover:bg-violet-50/40 transition-colors ${
        !isLast ? "border-b border-gray-100" : ""
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50 shadow-sm">
        <Receipt size={16} className="text-violet-600" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {invoice.productName || invoice.description || "Invoice"}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar size={10} /> {formatDate(invoice.createdAt)}
          </span>
          {invoice.invoiceNumber && (
            <>
              <span className="text-gray-200">·</span>
              <span className="font-mono">{invoice.invoiceNumber}</span>
            </>
          )}
          {period && (
            <>
              <span className="text-gray-200">·</span>
              <span>{period}</span>
            </>
          )}
        </div>
      </div>

      <div className="shrink-0 text-right hidden sm:block min-w-[80px]">
        <p className="text-sm font-bold text-gray-900">
          {formatAmount(invoice.amount, invoice.currency || "INR")}
        </p>
        {invoice.billingCycle && (
          <p className="text-[10px] text-gray-400 capitalize">{invoice.billingCycle}</p>
        )}
      </div>

      <div className="shrink-0 hidden xs:block">
        <InvoiceStatusBadge status={invoice.status || "paid"} />
      </div>

      <div className="shrink-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
        <Link
          href={`/invoices/${invoice.id}`}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-violet-200 bg-violet-50 text-[11px] font-semibold text-violet-700 hover:bg-violet-100 hover:border-violet-300 transition-colors"
        >
          <ExternalLink size={11} /> View
        </Link>
      </div>
    </div>
  );
}
