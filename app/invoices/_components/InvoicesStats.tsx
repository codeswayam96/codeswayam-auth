import React from "react";
import { IndianRupee, Receipt, TrendingUp } from "lucide-react";
import type { Invoice } from "@/lib/api";
import { formatAmount, formatDate } from "./InvoiceItemRow";

interface InvoicesStatsProps {
  invoices: Invoice[];
  totalPaid: number;
  paidCount: number;
  currency: string;
  lastInvoice?: Invoice;
}

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 bg-white shadow-sm ${accent}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</p>
          {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        <div className="p-2.5 rounded-xl bg-white/80 border border-current/10 shadow-sm shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function InvoicesStats({
  invoices,
  totalPaid,
  paidCount,
  currency,
  lastInvoice,
}: InvoicesStatsProps) {
  if (invoices.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        label="Total Paid"
        value={formatAmount(totalPaid, currency)}
        sub={`${paidCount} successful payment${paidCount !== 1 ? "s" : ""}`}
        icon={<IndianRupee size={18} className="text-emerald-600" />}
        accent="border-emerald-100"
      />
      <StatCard
        label="Total Invoices"
        value={String(invoices.length)}
        sub={`${invoices.filter((i) => i.status === "pending").length} pending`}
        icon={<Receipt size={18} className="text-violet-600" />}
        accent="border-violet-100"
      />
      <StatCard
        label="Last Payment"
        value={lastInvoice ? formatAmount(lastInvoice.amount, currency) : "—"}
        sub={lastInvoice ? formatDate(lastInvoice.createdAt) : "No payments yet"}
        icon={<TrendingUp size={18} className="text-blue-600" />}
        accent="border-blue-100"
      />
    </div>
  );
}
