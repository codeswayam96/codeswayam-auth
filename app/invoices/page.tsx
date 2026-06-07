"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText, ExternalLink, Loader2, AlertCircle,
  CheckCircle2, Clock, XCircle, Calendar, ArrowRight,
  Receipt, TrendingUp, Download, RefreshCw, IndianRupee,
} from "lucide-react";
import { fetchUserInvoices, type Invoice } from "@/lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(amount: number, currency: string) {
  if (!amount) return "Free";
  const val = amount / 100;
  return currency === "INR"
    ? `₹${val.toLocaleString("en-IN")}`
    : `$${val.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatPeriod(start?: string, end?: string) {
  if (!start || !end) return null;
  const s = new Date(start).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const e = new Date(end).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return `${s} – ${e}`;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { bg: string; text: string; border: string; dot: string; icon: React.ReactNode; label: string }> = {
  paid:     { bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500",  icon: <CheckCircle2 size={11} />, label: "Paid"     },
  pending:  { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500",    icon: <Clock size={11} />,        label: "Pending"  },
  failed:   { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500",      icon: <XCircle size={11} />,      label: "Failed"   },
  refunded: { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-500",     icon: <ArrowRight size={11} />,   label: "Refunded" },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}

// ─── Invoice Row ──────────────────────────────────────────────────────────────

function InvoiceRow({ invoice, isLast }: { invoice: Invoice; isLast: boolean }) {
  const period = formatPeriod(invoice.periodStart ?? undefined, invoice.periodEnd ?? undefined);

  return (
    <div className={`group flex items-center gap-4 px-5 py-4 hover:bg-violet-50/40 transition-colors ${!isLast ? "border-b border-gray-100" : ""}`}>
      {/* Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50 shadow-sm">
        <Receipt size={16} className="text-violet-600" />
      </div>

      {/* Meta */}
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

      {/* Amount */}
      <div className="shrink-0 text-right hidden sm:block min-w-[80px]">
        <p className="text-sm font-bold text-gray-900">
          {formatAmount(invoice.amount, invoice.currency || "INR")}
        </p>
        {invoice.billingCycle && (
          <p className="text-[10px] text-gray-400 capitalize">{invoice.billingCycle}</p>
        )}
      </div>

      {/* Status */}
      <div className="shrink-0 hidden xs:block">
        <StatusBadge status={invoice.status || "paid"} />
      </div>

      {/* Action */}
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

// ─── Summary Stat Card ────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, accent }: {
  label: string; value: string; sub?: string;
  icon: React.ReactNode; accent: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 bg-white shadow-sm ${accent}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const load = () => {
    return fetchUserInvoices()
      .then(setInvoices)
      .catch((err) => setError(err.message || "Failed to load invoices"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load().finally(() => setRefreshing(false));
  };

  const filtered = filter === "all" ? invoices : invoices.filter((i) => i.status === filter);

  const currency = invoices[0]?.currency || "INR";
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.amount || 0), 0);
  const paidCount = invoices.filter(i => i.status === "paid").length;
  const lastInvoice = [...invoices].sort((a, b) =>
    new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  )[0];

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center">
              <Receipt size={22} className="text-violet-400" />
            </div>
            <Loader2 size={18} className="animate-spin text-violet-600 absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Loading invoices…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">

      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-violet-800 px-6 py-7 text-white shadow-xl shadow-violet-900/10">
        {/* Decorative blobs */}
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
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>

            {invoices.length > 0 && (
              <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur px-5 py-3 text-center min-w-[120px]">
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-wider">Total Paid</p>
                <p className="text-2xl font-black mt-1">{formatAmount(totalPaid, currency)}</p>
                <p className="text-[10px] opacity-50 mt-0.5">{paidCount} invoice{paidCount !== 1 ? "s" : ""}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      {invoices.length > 0 && (
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
            sub={`${invoices.filter(i => i.status === "pending").length} pending`}
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
      )}

      {/* ── Filter Tabs ─────────────────────────────────────────────────── */}
      {invoices.length > 0 && (
        <div className="flex gap-1 border-b border-gray-200 overflow-x-auto no-scrollbar">
          {["all", "paid", "pending", "failed", "refunded"].map((f) => {
            const count = f === "all" ? invoices.length : invoices.filter(i => i.status === f).length;
            if (f !== "all" && count === 0) return null;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`-mb-px px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap capitalize ${
                  filter === f
                    ? "border-violet-600 text-violet-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {f === "all" ? "All" : f}
                <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                  filter === f
                    ? "bg-violet-100 text-violet-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Invoice Table / Empty ────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-gray-200 shadow-sm">
            <FileText size={26} className="text-gray-300" />
          </div>
          <p className="text-base font-bold text-gray-900">
            {filter === "all" ? "No invoices yet" : `No ${filter} invoices`}
          </p>
          <p className="mt-1.5 max-w-xs text-sm text-gray-400 leading-relaxed">
            {filter === "all"
              ? "Invoices will appear here after your first payment."
              : `You have no ${filter} invoices at this time.`}
          </p>
          {filter !== "all" && (
            <button
              onClick={() => setFilter("all")}
              className="mt-5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-violet-300 hover:text-violet-700 transition-colors shadow-sm"
            >
              View all invoices
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Table Header */}
          <div className="hidden sm:flex items-center gap-4 border-b border-gray-100 bg-gray-50/80 px-5 py-3">
            <div className="w-10 shrink-0" />
            <p className="flex-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Description</p>
            <p className="w-[90px] shrink-0 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">Amount</p>
            <p className="w-[90px] shrink-0 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</p>
            <div className="w-16 shrink-0" />
          </div>

          {/* Rows */}
          <div>
            {filtered.map((invoice, idx) => (
              <InvoiceRow
                key={invoice.id}
                invoice={invoice}
                isLast={idx === filtered.length - 1}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-3 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-medium">
              {filtered.length} invoice{filtered.length !== 1 ? "s" : ""}
              {filter !== "all" && ` · ${filter}`}
            </p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-violet-700">
              <Download size={12} />
              Total: {formatAmount(filtered.reduce((s, i) => s + (i.amount || 0), 0), currency)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
