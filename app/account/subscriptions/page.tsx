"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CreditCard, Calendar, DollarSign, AlertCircle, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAccount } from "../layout";

interface Subscription {
  id: string;
  productId: string;
  productName: string;
  plan: "free" | "pro" | "enterprise";
  status: "active" | "cancelled" | "paused" | "expired";
  price: number;
  currency: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
}

export default function SubscriptionsPage() {
  const { user } = useAccount();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState<string | null>(null);
  const [error, setError] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await fetch(`${apiUrl}/subscriptions`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch subscriptions");
        }

        const data = await res.json();
        setSubscriptions(data.subscriptions || data);
      } catch (err: any) {
        setError(err.message || "Failed to load subscriptions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [apiUrl]);

  const handleCancelSubscription = async (subscriptionId: string) => {
    setCancelling(subscriptionId);
    try {
      const res = await fetch(`${apiUrl}/subscriptions/${subscriptionId}/cancel`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to cancel subscription");
      }

      setSubscriptions(subscriptions.filter(s => s.id !== subscriptionId));
      toast.success("Subscription cancelled successfully");
      setCancelOpen(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel subscription");
    } finally {
      setCancelling(null);
    }
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === "active");
  const inactiveSubscriptions = subscriptions.filter(s => s.status !== "active");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "free":
        return "bg-slate-100 text-slate-800";
      case "pro":
        return "bg-blue-100 text-blue-800";
      case "enterprise":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                <p className="text-2xl font-bold mt-1">{activeSubscriptions.length}</p>
              </div>
              <CreditCard size={32} className="text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Monthly Cost</p>
                <p className="text-2xl font-bold mt-1">
                  {activeSubscriptions.reduce((sum, s) => sum + s.price, 0)}
                </p>
              </div>
              <DollarSign size={32} className="text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive Subscriptions</p>
                <p className="text-2xl font-bold mt-1">{inactiveSubscriptions.length}</p>
              </div>
              <AlertCircle size={32} className="text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Active Subscriptions */}
      {activeSubscriptions.length > 0 ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">Active Subscriptions</h3>
            <div className="grid gap-4">
              {activeSubscriptions.map((sub) => (
                <Card key={sub.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold">{sub.productName}</h4>
                          <Badge className={`${getPlanColor(sub.plan)}`}>
                            {sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)} Plan
                          </Badge>
                          <Badge className={`${getStatusColor(sub.status)}`}>
                            {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Price</p>
                            <p className="text-sm font-medium mt-1">
                              {sub.currency}{sub.price}/month
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Started</p>
                            <p className="text-sm font-medium mt-1">
                              {new Date(sub.startDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Renews</p>
                            <p className="text-sm font-medium mt-1">
                              {new Date(sub.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Auto Renewal</p>
                            <p className="text-sm font-medium mt-1">
                              {sub.autoRenew ? "Enabled" : "Disabled"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 md:flex-col">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`https://codeswayam.com/manage/${sub.productId}`} target="_blank" rel="noreferrer">
                            Manage
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCancelOpen(sub.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard size={48} className="text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No active subscriptions</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              You don&apos;t have any active subscriptions yet. Explore our products to get started.
            </p>
            <Button className="mt-6" asChild>
              <a href="/dashboard">Browse Products</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Inactive Subscriptions */}
      {inactiveSubscriptions.length > 0 && (
        <div className="space-y-4">
          <Separator />
          <h3 className="text-lg font-semibold">Inactive Subscriptions</h3>
          <div className="grid gap-4">
            {inactiveSubscriptions.map((sub) => (
              <Card key={sub.id} className="opacity-75">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold">{sub.productName}</h4>
                        <Badge className={`${getPlanColor(sub.plan)}`}>
                          {sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)} Plan
                        </Badge>
                        <Badge className={`${getStatusColor(sub.status)}`}>
                          {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Price</p>
                          <p className="text-sm font-medium mt-1">
                            {sub.currency}{sub.price}/month
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Started</p>
                          <p className="text-sm font-medium mt-1">
                            {new Date(sub.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Ended</p>
                          <p className="text-sm font-medium mt-1">
                            {new Date(sub.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancelOpen} onOpenChange={() => setCancelOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this subscription? You&apos;ll lose access to the product&apos;s features immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(null)}>
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelOpen && handleCancelSubscription(cancelOpen)}
              disabled={cancelling === cancelOpen}
            >
              {cancelling === cancelOpen && <Loader2 size={14} className="animate-spin mr-1" />}
              Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
