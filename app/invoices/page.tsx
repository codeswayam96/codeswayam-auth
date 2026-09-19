"use client";

import { useEffect, useState } from "react";
import {
  FileText, Loader2, AlertCircle, Receipt, Download,
} from "lucide-react";
import { fetchUserInvoices, type Invoice } from "@/lib/api";
import {
  InvoiceItemRow,
  InvoicesHeader,
  InvoicesStats,
  InvoicesFilterTabs,
  formatAmount,
} from "./_components";

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

  useEffect(() => {
    load();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load().finally(() => setRefreshing(false));
  };

  const filtered =
    filter === "all" ? invoices : invoices.filter((i) => i.status === filter);

  const currency = invoices[0]?.currency || "INR";
  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + (i.amount || 0), 0);
  const paidCount = invoices.filter((i) => i.status === "paid").length;
  const lastInvoice = [...invoices].sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  )[0];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center">
              <Receipt size={22} className="text-violet-400" />
            </div>
            <Loader2
              size={18}
              className="animate-spin text-violet-600 absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow"
            />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Loading invoices…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <InvoicesHeader
        refreshing={refreshing}
        totalPaid={totalPaid}
        paidCount={paidCount}
        currency={currency}
        hasInvoices={invoices.length > 0}
        onRefresh={handleRefresh}
      />

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}

      <InvoicesStats
        invoices={invoices}
        totalPaid={totalPaid}
        paidCount={paidCount}
        currency={currency}
        lastInvoice={lastInvoice}
      />

      <InvoicesFilterTabs
        invoices={invoices}
        filter={filter}
        onFilterChange={setFilter}
      />

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
          <div className="hidden sm:flex items-center gap-4 border-b border-gray-100 bg-gray-50/80 px-5 py-3">
            <div className="w-10 shrink-0" />
            <p className="flex-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Description
            </p>
            <p className="w-[90px] shrink-0 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Amount
            </p>
            <p className="w-[90px] shrink-0 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Status
            </p>
            <div className="w-16 shrink-0" />
          </div>

          <div>
            {filtered.map((invoice, idx) => (
              <InvoiceItemRow
                key={invoice.id}
                invoice={invoice}
                isLast={idx === filtered.length - 1}
              />
            ))}
          </div>

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
