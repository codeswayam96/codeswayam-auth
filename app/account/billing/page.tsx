"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, DollarSign, Download, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";

interface PaymentMethod {
  id: string;
  type: "card" | "bank";
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  pdfUrl: string;
}

export default function BillingPage() {
  const paymentMethods: PaymentMethod[] = [];
  const invoices: Invoice[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Billing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Monthly Cost</p>
                <p className="text-3xl font-bold mt-1">$19</p>
              </div>
              <DollarSign size={32} className="text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Annual Projection</p>
                <p className="text-3xl font-bold mt-1">$228</p>
              </div>
              <TrendingUp size={32} className="text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next Billing Date</p>
                <p className="text-lg font-bold mt-1">
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
              <CreditCard size={32} className="text-primary/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard size={18} className="text-primary" />
                Payment Methods
              </CardTitle>
              <CardDescription>Add and manage your payment methods</CardDescription>
            </div>
            <Button size="sm">
              <Plus size={14} className="mr-1" />
              Add Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {method.type === "card"
                        ? `Card ending in ${method.last4}`
                        : `Bank account ending in ${method.last4}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expires {method.expiryMonth.toString().padStart(2, "0")}/
                      {method.expiryYear}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {method.isDefault && (
                      <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                    )}
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard size={32} className="mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No payment methods on file</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add a payment method to start purchasing subscriptions
              </p>
              <Button className="mt-4">
                <Plus size={14} className="mr-1" />
                Add Payment Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download size={18} className="text-primary" />
            Billing History
          </CardTitle>
          <CardDescription>View and download your invoices and receipts</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{invoice.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(invoice.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">
                        {invoice.currency}
                        {invoice.amount}
                      </p>
                      <Badge className={`${getStatusColor(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() +
                          invoice.status.slice(1)}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={invoice.pdfUrl} download>
                        <Download size={14} />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Download size={32} className="mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No invoices yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your invoices will appear here once you make a purchase
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing FAQs */}
      <Card className="bg-blue-50/30 border-blue-200/50">
        <CardHeader>
          <CardTitle className="text-base text-blue-900">Billing Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900">❓ When will I be charged?</p>
            <p className="text-sm text-blue-800">
              You&apos;ll be charged on your billing date each month for your active subscriptions.
            </p>
          </div>
          <Separator className="bg-blue-200/50" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900">
              ❓ Can I change my billing frequency?
            </p>
            <p className="text-sm text-blue-800">
              Contact our support team to discuss custom billing arrangements for enterprise accounts.
            </p>
          </div>
          <Separator className="bg-blue-200/50" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900">❓ How do refunds work?</p>
            <p className="text-sm text-blue-800">
              Refunds are processed within 5-7 business days. Contact support for refund requests.
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
