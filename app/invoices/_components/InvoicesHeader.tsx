import React from "react";
import { FileText, RefreshCw } from "lucide-react";
import { formatAmount } from "./InvoiceItemRow";

interface InvoicesHeaderProps {
  refreshing: boolean;
  totalPaid: number;
  paidCount: number;
  currency: string;
  hasInvoices: boolean;
  onRefresh: () => void;
}

export function InvoicesHeader({
  refreshing,
  totalPaid,
  paidCount,
  currency,
  hasInvoices,
  onRefresh,
}: InvoicesHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-violet-800 px-6 py-7 text-white shadow-xl shadow-violet-900/10">
      <div className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-8 bottom-0 w-40 h-40 rounded-full bg-purple-500/10 blur-2xl" />
      <div className="pointer-events-none absolute right-16 bottom-0 opacity-[0.06]">
        <FileText size={140} />
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">
            Billing History
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Invoices</h1>
          <p className="mt-1.5 text-sm opacity-60 max-w-xs">
            All your payment receipts and billing records in one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          {hasInvoices && (
            <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur px-5 py-3 text-center min-w-[120px]">
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-wider">Total Paid</p>
              <p className="text-2xl font-black mt-1">{formatAmount(totalPaid, currency)}</p>
              <p className="text-[10px] opacity-50 mt-0.5">
                {paidCount} invoice{paidCount !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
