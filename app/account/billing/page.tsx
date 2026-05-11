"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard, TrendingUp, Download, Loader2, AlertCircle,
  Calendar, FileText, CheckCircle2, Clock, XCircle, Receipt,
  ArrowUpRight, Package,
} from "lucide-react";
import Link from "next/link";
import { fetchBillingOverview, fetchUserInvoices } from "@/lib/api";
import type { BillingOverview, Invoice } from "@/lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatInr(paise: number) {
  if (!paise || paise === 0) return "₹0";
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function formatCurrency(amount: number, currency: string) {
  if (!amount) return currency === "INR" ? "₹0" : "$0";
  const val = amount / 100;
  return currency === "INR"
    ? `₹${val.toLocaleString("en-IN")}`
    : `$${val.toLocaleString("en-US")}`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const statusCfg: Record<string, { label: string; bg: string; text: string; border: string; Icon: any }> = {
  paid:    { label: "Paid",    bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", Icon: CheckCircle2 },
  pending: { label: "Pending", bg: "#fffbeb", text: "#b45309", border: "#fde68a", Icon: Clock },
  failed:  { label: "Failed",  bg: "#fef2f2", text: "#dc2626", border: "#fecaca", Icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusCfg[status] || statusCfg.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      padding: "3px 8px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.04em",
      backgroundColor: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
    }}>
      <cfg.Icon size={10} />
      {cfg.label}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor }: {
  label: string; value: string; sub?: string;
  icon: any; iconBg: string; iconColor: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1 leading-tight">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0, marginLeft: 12,
            backgroundColor: iconBg, display: "flex", alignItems: "center",
            justifyContent: "center", color: iconColor,
          }}>
            <Icon size={18} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Invoice Row ──────────────────────────────────────────────────────────────

function InvoiceRow({ invoice }: { invoice: Invoice }) {
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
              Until {new Date(invoice.periodEnd).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={invoice.status} />
          <Button variant="outline" size="sm" className="h-7 w-7 sm:w-auto p-0 sm:px-2.5 text-xs gap-1" asChild>
            <Link href={`/invoices/${invoice.id}`} target="_blank" title="Download PDF">
              <Download size={11} /> <span className="hidden sm:inline">PDF</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [overview, setOverview] = useState<BillingOverview | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [invPage, setInvPage] = useState(1);
  const INV_PAGE_SIZE = 10;
  const invTotalPages = Math.max(1, Math.ceil(invoices.length / INV_PAGE_SIZE));
  const pagedInvoices = invoices.slice((invPage - 1) * INV_PAGE_SIZE, invPage * INV_PAGE_SIZE);

  useEffect(() => {
    Promise.all([fetchBillingOverview(), fetchUserInvoices()])
      .then(([ov, inv]) => {
        setOverview(ov);
        setInvoices(Array.isArray(inv) ? inv : []);
      })
      .catch((e: any) => setError(e.message || "Failed to load billing data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
        <AlertCircle size={16} className="shrink-0" />
        {error}
      </div>
    );
  }

  const currency = overview?.currency ?? "INR";
  const nextDate = overview?.nextBillingDate
    ? new Date(overview.nextBillingDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "No upcoming renewal";

  const paidInvoices = invoices.filter(i => i.status === "paid");

  return (
    <div className="space-y-6">

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="col-span-2 md:col-span-1">
            <StatCard
            label="Monthly Spend"
            value={formatCurrency(overview?.totalMonthlySpend ?? 0, currency)}
            sub={overview?.activeCount ? `${overview.activeCount} active plan${overview.activeCount !== 1 ? "s" : ""}` : "No active plans"}
            icon={CreditCard}
            iconBg="#ede9fe"
            iconColor="#7c3aed"
            />
        </div>
        <StatCard
          label="Projection"
          value={formatCurrency(overview?.annualProjection ?? 0, currency)}
          icon={TrendingUp}
          iconBg="#dbeafe"
          iconColor="#2563eb"
        />
        <StatCard
          label="Next Date"
          value={overview?.nextBillingDate
            ? new Date(overview.nextBillingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
            : "—"}
          icon={Calendar}
          iconBg="#dcfce7"
          iconColor="#16a34a"
        />
      </div>

      {/* ── Payment Method Note ── */}
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

      {/* ── Invoice History ── */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText size={16} className="text-primary" />
                Billing History
              </CardTitle>
              <CardDescription className="mt-0.5">
                {paidInvoices.length > 0
                  ? `${invoices.length} invoice${invoices.length !== 1 ? "s" : ""} · ₹${paidInvoices.reduce((s, i) => s + i.amount, 0) / 100} total paid`
                  : "Your invoices will appear here after your first payment"}
              </CardDescription>
            </div>
            {invoices.length > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
                <ArrowUpRight size={12} />
                Click any row to view receipt
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-2">
              {pagedInvoices.map((invoice) => (
                <InvoiceRow key={invoice.id} invoice={invoice} />
              ))}
              {invTotalPages > 1 && (
                <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
                  <span>{(invPage - 1) * INV_PAGE_SIZE + 1}–{Math.min(invPage * INV_PAGE_SIZE, invoices.length)} of {invoices.length} invoices</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setInvPage(p => Math.max(1, p - 1))} disabled={invPage === 1}
                      className="h-7 w-7 flex items-center justify-center rounded border disabled:opacity-40 hover:bg-muted">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <span className="px-2">{invPage} / {invTotalPages}</span>
                    <button onClick={() => setInvPage(p => Math.min(invTotalPages, p + 1))} disabled={invPage === invTotalPages}
                      className="h-7 w-7 flex items-center justify-center rounded border disabled:opacity-40 hover:bg-muted">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <Download size={24} className="text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No invoices yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Invoices are generated automatically after each payment
              </p>
              <Button className="mt-4" size="sm" asChild>
                <Link href="/dashboard">
                  <Package size={13} className="mr-1" />
                  Browse Plans
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Billing FAQs ── */}
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
    </div>
  );
}
