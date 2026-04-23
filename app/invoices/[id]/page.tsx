"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchInvoiceById } from "@/lib/api";
import type { Invoice } from "@/lib/api";
import { Loader2, Printer, ArrowLeft, CheckCircle2, Download } from "lucide-react";
import Link from "next/link";

function formatCurrency(amount: number, currency: string) {
  const val = amount / 100;
  return currency === "INR"
    ? `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
    : `$${val.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function InvoiceReceiptPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchInvoiceById(id)
      .then(setInvoice)
      .catch((e: any) => setError(e.message || "Invoice not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={28} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-3 bg-gray-50">
        <p className="text-red-600 font-semibold">{error || "Invoice not found"}</p>
        <Link href="/account/billing" className="text-violet-700 text-sm">← Back to Billing</Link>
      </div>
    );
  }

  const periodLabel = invoice.periodStart && invoice.periodEnd
    ? `${formatDate(invoice.periodStart)} – ${formatDate(invoice.periodEnd)}`
    : null;

  const handleDownloadPdf = async () => {
    try {
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('invoice-content');
      if (!element) return;
      const opt = {
        margin: 0.5,
        filename: `receipt-${invoice?.invoiceNumber || id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().from(element).set(opt).save();
    } catch (err) {
      console.error("Failed to generate PDF", err);
    }
  };

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          .receipt-wrapper { box-shadow: none !important; border: none !important; border-radius: 0 !important; margin: 0 !important; max-width: 100% !important; }
        }
      `}</style>

      {/* Screen-only toolbar */}
      <div className="no-print fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link
          href="/account/billing"
          className="flex items-center gap-1.5 text-gray-700 text-[13px] font-semibold no-underline"
        >
          <ArrowLeft size={14} /> Back to Billing
        </Link>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-gray-700 text-[13px] font-semibold border border-gray-300 cursor-pointer"
          >
            <Printer size={13} /> Print
          </button>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-700 text-white text-[13px] font-semibold border-none cursor-pointer"
          >
            <Download size={13} /> Download PDF
          </button>
        </div>
      </div>

      {/* Receipt */}
      <div className="bg-gray-50 min-h-screen pt-[72px] pb-12">
        <div
          id="invoice-content"
          className="receipt-wrapper max-w-[640px] mx-auto bg-white rounded-2xl border border-gray-200 shadow-[0_4px_32px_rgba(0,0,0,0.07)] px-10 py-12"
        >

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-9 h-9 rounded-[9px] bg-gradient-to-br from-violet-700 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-black text-base">C</span>
                </div>
                <span className="text-lg font-extrabold text-gray-900">CodeSwayam</span>
              </div>
              <p className="text-xs text-gray-500 m-0">codeswayam.com</p>
            </div>
            <div className="text-right">
              <p className="m-0 text-[22px] font-black text-gray-900">INVOICE</p>
              <p className="m-0 mt-1 text-[13px] text-gray-500 font-semibold">{invoice.invoiceNumber}</p>
            </div>
          </div>

          {/* Paid stamp */}
          {invoice.status === "paid" && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-[10px] px-4 py-2.5 mb-7">
              <CheckCircle2 size={16} className="text-green-600 shrink-0" />
              <span className="text-[13px] font-bold text-green-700">Payment Confirmed</span>
              <span className="text-xs text-gray-500 ml-auto">{formatDate(invoice.createdAt)}</span>
            </div>
          )}

          {/* Bill to / Invoice Meta */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 m-0 mb-2">Bill To</p>
              <p className="m-0 mb-0.5 text-sm font-bold text-gray-900">{invoice.userName || "—"}</p>
              <p className="m-0 text-[13px] text-gray-500">{invoice.userEmail || "—"}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 m-0 mb-2">Invoice Details</p>
              <div className="flex flex-col gap-[3px] items-end">
                <div className="flex gap-2 text-[13px]">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-gray-700 font-semibold">{formatDate(invoice.createdAt)}</span>
                </div>
                {invoice.razorpayPaymentId && (
                  <div className="flex gap-2 text-xs">
                    <span className="text-gray-400">Payment ID:</span>
                    <span className="text-gray-700 font-mono text-[11px]">{invoice.razorpayPaymentId}</span>
                  </div>
                )}
                {invoice.billingCycle && (
                  <div className="flex gap-2 text-[13px]">
                    <span className="text-gray-400">Cycle:</span>
                    <span className="text-gray-700 font-semibold capitalize">{invoice.billingCycle}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line items table */}
          <div className="border border-gray-200 rounded-[10px] overflow-hidden mb-6">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto] bg-gray-50 px-4 py-2.5 border-b border-gray-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Description</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Amount</span>
            </div>
            {/* Row */}
            <div className="grid grid-cols-[1fr_auto] p-4 items-start">
              <div>
                <p className="m-0 mb-[3px] text-sm font-semibold text-gray-900">{invoice.productName || invoice.description}</p>
                {periodLabel && (
                  <p className="m-0 text-xs text-gray-500">Service period: {periodLabel}</p>
                )}
                <p className="m-0 mt-[3px] text-xs text-gray-500">{invoice.description}</p>
              </div>
              <span className="text-[15px] font-bold text-gray-900 pl-6">
                {formatCurrency(invoice.amount, invoice.currency)}
              </span>
            </div>
          </div>

          {/* Totals */}
          <div className="flex flex-col gap-1.5 items-end mb-8">
            <div className="flex gap-12 text-[13px] text-gray-500">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.amount, invoice.currency)}</span>
            </div>
            <div className="flex gap-12 text-[13px] text-gray-500">
              <span>Tax (GST)</span>
              <span>Included</span>
            </div>
            <div className="h-px w-full max-w-[260px] bg-gray-200 my-1" />
            <div className="flex gap-12 text-[17px] font-extrabold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(invoice.amount, invoice.currency)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-5 flex items-center justify-between flex-wrap gap-3">
            <p className="m-0 text-xs text-gray-400">
              Thank you for your purchase. For support, contact support@codeswayam.com
            </p>
            <p className="m-0 text-[11px] text-gray-300 font-semibold">
              CodeSwayam · codeswayam.com
            </p>
          </div>
        </div>
      </div>
    </>
  );
}