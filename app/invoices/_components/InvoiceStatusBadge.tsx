import React from "react";
import { CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";

export const STATUS_CFG: Record<
  string,
  { bg: string; text: string; border: string; dot: string; icon: React.ReactNode; label: string }
> = {
  paid:     { bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500",  icon: <CheckCircle2 size={11} />, label: "Paid"     },
  pending:  { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500",    icon: <Clock size={11} />,        label: "Pending"  },
  failed:   { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500",      icon: <XCircle size={11} />,      label: "Failed"   },
  refunded: { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-500",     icon: <ArrowRight size={11} />,   label: "Refunded" },
};

export function InvoiceStatusBadge({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${c.bg} ${c.text} ${c.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}
