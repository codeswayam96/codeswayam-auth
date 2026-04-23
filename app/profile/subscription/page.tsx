"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Crown,
    Check,
    Sparkles,
    CreditCard,
    Calendar,
    ArrowUpRight,
    Loader2,
    AlertTriangle,
    Globe,
    Zap,
    X,
    RefreshCw,
    Package,
    CheckCircle2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useProfile } from "../layout";
import {
    fetchPublicPlans,
    fetchUserSubscriptions,
    createRazorpayOrder,
    verifyRazorpayPayment,
    cancelUserSubscription,
    type UserSubscription,
    type SaasProduct,
    type BundlePlan,
} from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────────
type BillingCycle = "monthly" | "yearly";
type Currency = "INR" | "USD";

// ─── Razorpay window type ──────────────────────────────────────────────────────
declare global {
    interface Window {
        Razorpay: any;
    }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        if (typeof window === "undefined") return resolve(false);
        if (window.Razorpay) return resolve(true);

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

function formatPrice(amountInPaise: number, currency: Currency): string {
    if (amountInPaise === 0) return "Free";
    const amount = amountInPaise / 100;
    if (currency === "INR") return `₹${amount.toLocaleString("en-IN")}`;
    return `$${amount.toLocaleString("en-US")}`;
}

function getYearlySavings(monthly: number, yearly: number): number {
    if (!monthly || !yearly) return 0;
    const annualIfMonthly = monthly * 12;
    return Math.round(((annualIfMonthly - yearly) / annualIfMonthly) * 100);
}

// ─── Plan Card Component ───────────────────────────────────────────────────────
function PlanCard({
    plan,
    isBundle,
    billingCycle,
    currency,
    currentSubIds,
    onSubscribe,
    loadingId,
}: {
    plan: SaasProduct | BundlePlan;
    isBundle: boolean;
    billingCycle: BillingCycle;
    currency: Currency;
    currentSubIds: Set<number>;
    onSubscribe: (plan: SaasProduct | BundlePlan, isBundle: boolean) => void;
    loadingId: number | null;
}) {
    const pricing = plan.pricing?.[currency];
    const price = billingCycle === "yearly" ? (pricing?.yearly ?? 0) : (pricing?.monthly ?? 0);
    const isFree = price === 0;
    const isActive = currentSubIds.has(Number(plan.id));
    const savings = pricing ? getYearlySavings(pricing.monthly, pricing.yearly) : 0;
    const isPopular = !isBundle && (plan as SaasProduct).planTier === "pro";
    const isLoading = loadingId === Number(plan.id);

    return (
        <Card className={`relative flex flex-col transition-all duration-200 ${isPopular ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20" : ""} ${isActive ? "bg-primary/5 border-primary/30" : ""}`}>
            {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="text-xs px-3 py-0.5 shadow-sm">Most Popular</Badge>
                </div>
            )}
            {isActive && (
                <div className="absolute -top-3 right-4">
                    <Badge variant="outline" className="text-xs border-primary text-primary bg-background">
                        <CheckCircle2 size={12} className="mr-1" /> Active
                    </Badge>
                </div>
            )}

            <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-1">
                    {isBundle ? (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                            <Package size={16} className="text-white" />
                        </div>
                    ) : (
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Zap size={16} className="text-primary" />
                        </div>
                    )}
                    <div>
                        <CardTitle className="text-base">{plan.name}</CardTitle>
                        {isBundle && <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Bundle</span>}
                    </div>
                </div>

                <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold">{formatPrice(price, currency)}</span>
                    {!isFree && (
                        <span className="text-sm text-muted-foreground">
                            /{billingCycle === "yearly" ? "yr" : "mo"}
                        </span>
                    )}
                </div>
                {billingCycle === "yearly" && savings > 0 && (
                    <span className="text-xs text-emerald-600 font-medium">Save {savings}% vs monthly</span>
                )}
                <CardDescription className="mt-1">{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="pb-3 flex-1">
                <ul className="space-y-2">
                    {(plan.features || []).map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                            <Check size={14} className="text-primary shrink-0 mt-0.5" />
                            {f}
                        </li>
                    ))}
                </ul>
            </CardContent>

            <CardFooter>
                {isActive ? (
                    <Button variant="outline" className="w-full" disabled>
                        <CheckCircle2 size={14} className="mr-2 text-primary" /> Current Plan
                    </Button>
                ) : (
                    <Button
                        className="w-full"
                        variant={isPopular ? "default" : "outline"}
                        onClick={() => onSubscribe(plan, isBundle)}
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 size={14} className="mr-2 animate-spin" />}
                        {isFree ? "Start Free" : "Subscribe"}
                        {!isFree && !isLoading && <ArrowUpRight size={14} className="ml-1" />}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
    const { user } = useProfile();

    const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");
    const [currency, setCurrency] = useState<Currency>("INR");
    const [plans, setPlans] = useState<{ products: SaasProduct[]; bundles: BundlePlan[] } | null>(null);
    const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [cancelId, setCancelId] = useState<number | null>(null);
    const [canceling, setCanceling] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

    const currentSubIds = new Set(
        subscriptions
            .filter(s => s.status === "active")
            .map(s => s.saasProductId || s.bundleId || -1)
    );

    // Fetch plans + user subscriptions
    const loadData = useCallback(async () => {
        setLoadingPlans(true);
        try {
            const [plansData, subsData] = await Promise.all([
                fetchPublicPlans(),
                fetchUserSubscriptions().catch(() => []),
            ]);
            setPlans(plansData);
            setSubscriptions(subsData);
        } catch (e) {
            toast.error("Failed to load plans. Please refresh.");
        } finally {
            setLoadingPlans(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Handle Razorpay checkout
    const handleSubscribe = async (plan: SaasProduct | BundlePlan, isBundle: boolean) => {
        if (!user) { toast.error("Please log in first"); return; }
        setLoadingId(Number(plan.id));

        try {
            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                toast.error("Could not load payment gateway. Please try again.");
                setLoadingId(null);
                return;
            }

            // Create order on backend
            const orderData = await createRazorpayOrder({
                saasProductId: isBundle ? undefined : Number(plan.id),
                bundleId: isBundle ? Number(plan.id) : undefined,
                billingCycle,
                currency,
            });

            // Free plan — no payment needed
            if ((orderData as any).free) {
                setPaymentSuccess(plan.name);
                await loadData();
                setLoadingId(null);
                return;
            }

            // Open Razorpay checkout
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "CodeSwayam",
                description: `${plan.name} — ${billingCycle}`,
                order_id: orderData.orderId,
                prefill: {
                    name: user.name || "",
                    email: user.email || "",
                },
                theme: {
                    color: "#8b5cf6",
                    backdrop_color: "rgba(0,0,0,0.6)",
                },
                modal: {
                    ondismiss: () => {
                        toast.info("Payment cancelled");
                        setLoadingId(null);
                    },
                },
                handler: async (response: {
                    razorpay_order_id: string;
                    razorpay_payment_id: string;
                    razorpay_signature: string;
                }) => {
                    try {
                        // Verify payment on backend
                        await verifyRazorpayPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            saasProductId: isBundle ? undefined : Number(plan.id),
                            bundleId: isBundle ? Number(plan.id) : undefined,
                            billingCycle,
                            currency,
                            amount: orderData.amount,
                        });

                        setPaymentSuccess(plan.name);
                        await loadData();
                        toast.success(`🎉 Subscribed to ${plan.name}!`);
                    } catch (e: any) {
                        toast.error(e.message || "Payment verification failed");
                    } finally {
                        setLoadingId(null);
                    }
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", (response: any) => {
                toast.error(`Payment failed: ${response.error.description}`);
                setLoadingId(null);
            });
            rzp.open();
        } catch (e: any) {
            toast.error(e.message || "Failed to initiate payment");
            setLoadingId(null);
        }
    };

    // Cancel subscription
    const handleCancel = async () => {
        if (!cancelId) return;
        setCanceling(true);
        try {
            await cancelUserSubscription(cancelId);
            toast.success("Subscription cancelled");
            await loadData();
            setCancelId(null);
        } catch (e: any) {
            toast.error(e.message || "Failed to cancel subscription");
        } finally {
            setCanceling(false);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-8">
            {/* Payment Success Banner */}
            {paymentSuccess && (
                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4">
                    <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
                    <div>
                        <p className="font-semibold text-emerald-900">Subscription Activated!</p>
                        <p className="text-sm text-emerald-700">You now have access to <strong>{paymentSuccess}</strong>.</p>
                    </div>
                    <button className="ml-auto text-emerald-500 hover:text-emerald-700" onClick={() => setPaymentSuccess(null)}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Current Subscriptions */}
            {subscriptions.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Crown size={18} className="text-primary" /> Active Subscriptions
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={loadData} className="h-8 px-2">
                                <RefreshCw size={14} className="mr-1" /> Refresh
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {subscriptions.map(sub => (
                            <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Zap size={14} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{sub.productName || sub.bundleName || "Plan"}</p>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {sub.billingCycle} · {sub.currency} {sub.amount ? formatPrice(sub.amount, sub.currency as Currency) : "Free"}
                                            {sub.expiresAt && ` · Expires ${new Date(sub.expiresAt).toLocaleDateString()}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={sub.status === "active" ? "success" : "destructive"} className="text-xs capitalize">
                                        {sub.status}
                                    </Badge>
                                    {sub.status === "active" && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => setCancelId(sub.id)}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Plans Header */}
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-semibold">Available Plans</h3>
                        <p className="text-sm text-muted-foreground">Choose a plan that works for your needs</p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Currency Selector */}
                        <div className="flex items-center gap-1 rounded-lg border p-1 bg-muted/30">
                            <button
                                onClick={() => setCurrency("INR")}
                                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-all ${currency === "INR" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <Globe size={12} /> ₹ INR
                            </button>
                            <button
                                onClick={() => setCurrency("USD")}
                                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-all ${currency === "USD" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <Globe size={12} /> $ USD
                            </button>
                        </div>

                        {/* Billing Cycle */}
                        <div className="flex items-center gap-1 rounded-lg border p-1 bg-muted/30">
                            <button
                                onClick={() => setBillingCycle("monthly")}
                                className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${billingCycle === "monthly" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle("yearly")}
                                className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${billingCycle === "yearly" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Yearly
                                <span className="ml-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                                    SAVE
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Plans Grid */}
                {loadingPlans ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={28} className="animate-spin text-muted-foreground" />
                    </div>
                ) : !plans || (plans.products.length === 0 && plans.bundles.length === 0) ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <Sparkles size={36} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No plans available right now. Check back soon.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Individual Products */}
                        {plans.products.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Individual Products</h4>
                                <div className={`grid gap-4 ${plans.products.length === 1 ? "grid-cols-1 max-w-sm" : plans.products.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                                    {plans.products.map(product => (
                                        <PlanCard
                                            key={product.id}
                                            plan={product}
                                            isBundle={false}
                                            billingCycle={billingCycle}
                                            currency={currency}
                                            currentSubIds={currentSubIds}
                                            onSubscribe={handleSubscribe}
                                            loadingId={loadingId}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bundles */}
                        {plans.bundles.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Bundles</h4>
                                <div className={`grid gap-4 ${plans.bundles.length === 1 ? "grid-cols-1 max-w-sm" : "grid-cols-1 sm:grid-cols-2"}`}>
                                    {plans.bundles.map(bundle => (
                                        <PlanCard
                                            key={bundle.id}
                                            plan={bundle}
                                            isBundle={true}
                                            billingCycle={billingCycle}
                                            currency={currency}
                                            currentSubIds={currentSubIds}
                                            onSubscribe={handleSubscribe}
                                            loadingId={loadingId}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Billing Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard size={16} /> Billing & Payments
                    </CardTitle>
                    <CardDescription>Secure payments powered by Razorpay</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Check size={12} className="text-emerald-500" /> UPI Supported
                        </span>
                        <span className="flex items-center gap-1">
                            <Check size={12} className="text-emerald-500" /> Debit / Credit Cards
                        </span>
                        <span className="flex items-center gap-1">
                            <Check size={12} className="text-emerald-500" /> Net Banking
                        </span>
                        <span className="flex items-center gap-1">
                            <Check size={12} className="text-emerald-500" /> International Cards
                        </span>
                        <span className="flex items-center gap-1">
                            <Check size={12} className="text-emerald-500" /> 256-bit SSL Encrypted
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Cancel Confirmation Dialog */}
            <Dialog open={!!cancelId} onOpenChange={(open) => !open && setCancelId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle size={18} className="text-destructive" /> Cancel Subscription?
                        </DialogTitle>
                        <DialogDescription>
                            Your subscription will remain active until the current billing period ends. You can resubscribe at any time.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setCancelId(null)}>Keep Subscription</Button>
                        <Button variant="destructive" onClick={handleCancel} disabled={canceling}>
                            {canceling && <Loader2 size={14} className="mr-2 animate-spin" />}
                            Yes, Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
