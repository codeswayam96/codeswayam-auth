"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard, TrendingUp, Download, AlertCircle,
  Calendar, FileText, ArrowUpRight, Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrandLoader } from "@/components/brand-loader";
import { fetchBillingOverview, fetchUserInvoices } from "@/lib/api";
import type { BillingOverview, Invoice } from "@/lib/api";
import {
  StatCard,
  InvoiceRow,
  BillingFaqCard,
  RazorpayNoteCard,
  formatCurrency,
} from "./_components";

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
    return <BrandLoader size="md" text="Loading billing history..." />;
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
  const paidInvoices = invoices.filter((i) => i.status === "paid");

  return (
    <div className="space-y-6">
      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="col-span-2 md:col-span-1">
          <StatCard
            label="Monthly Spend"
            value={formatCurrency(overview?.totalMonthlySpend ?? 0, currency)}
            sub={
              overview?.activeCount
                ? `${overview.activeCount} active plan${overview.activeCount !== 1 ? "s" : ""}`
                : "No active plans"
            }
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
          value={
            overview?.nextBillingDate
              ? new Date(overview.nextBillingDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })
              : "—"
          }
          icon={Calendar}
          iconBg="#dcfce7"
          iconColor="#16a34a"
        />
      </div>

      {/* ── Payment Method Note ── */}
      <RazorpayNoteCard />

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
                  <span>
                    {(invPage - 1) * INV_PAGE_SIZE + 1}–{Math.min(invPage * INV_PAGE_SIZE, invoices.length)} of{" "}
                    {invoices.length} invoices
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setInvPage((p) => Math.max(1, p - 1))}
                      disabled={invPage === 1}
                      className="h-7 w-7 flex items-center justify-center rounded border disabled:opacity-40 hover:bg-muted"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <span className="px-2">
                      {invPage} / {invTotalPages}
                    </span>
                    <button
                      onClick={() => setInvPage((p) => Math.min(invTotalPages, p + 1))}
                      disabled={invPage === invTotalPages}
                      className="h-7 w-7 flex items-center justify-center rounded border disabled:opacity-40 hover:bg-muted"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
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
      <BillingFaqCard />
    </div>
  );
}
