"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Crown,
    Check,
    Sparkles,
    CreditCard,
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
    cancelUserSubscription,
    type UserSubscription,
    type SaasProduct,
    type BundlePlan,
} from "@/lib/api";
import { RazorpayButton } from "@/components/razorpay-checkout";

// ─── Types ─────────────────────────────────────────────────────────────────────
type BillingCycle = "monthly" | "yearly";
type Currency = "INR" | "USD";

// Tier order — must match the backend planTier values
const TIERS = ["free", "standard", "pro", "enterprise"];

// ─── Helpers ───────────────────────────────────────────────────────────────────
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

const normalizeFamily = (str?: string) => str?.toLowerCase().replace(/[\s_-]+/g, "") || "";
const normalizeSaasPrefix = (saasId?: string) => saasId?.split("-")[0]?.toLowerCase() || "";

function getHiddenProductIds(
    activeSubs: UserSubscription[],
    allProducts: SaasProduct[]
): Set<number> {
    const hidden = new Set<number>();
    const activeProductIds = new Set(activeSubs.map(s => s.saasProductId).filter(Boolean));

    const highestActiveTierByFamily: Record<string, number> = {};
    for (const sub of activeSubs) {
        const product = allProducts.find(p => p.id === sub.saasProductId);
        if (!product) continue;
        const family = normalizeFamily(product.productFamily || product.tag);
        const saasPrefix = normalizeSaasPrefix(product.saasId);
        const tierIdx = TIERS.indexOf(product.planTier || "free");
        for (const key of [family, saasPrefix].filter(Boolean)) {
            if (highestActiveTierByFamily[key] === undefined || tierIdx > highestActiveTierByFamily[key]) {
                highestActiveTierByFamily[key] = tierIdx;
            }
        }
    }

    for (const product of allProducts) {
        const family = normalizeFamily(product.productFamily || product.tag);
        const saasPrefix = normalizeSaasPrefix(product.saasId);
        const tierIdx = TIERS.indexOf(product.planTier || "free");
        const highestActive = Math.max(
            highestActiveTierByFamily[family] ?? -1,
            highestActiveTierByFamily[saasPrefix] ?? -1
        );

        if (activeProductIds.has(product.id as number)) {
            hidden.add(product.id as number);
            continue;
        }
        if (highestActive >= 0 && tierIdx <= highestActive) {
            hidden.add(product.id as number);
        }
    }

    return hidden;
}

// ─── Plan Card Component ───────────────────────────────────────────────────────
function PlanCard({
    plan,
    isBundle,
    billingCycle,
    currency,
    onSuccess,
    returnUrl,
}: {
    plan: SaasProduct | BundlePlan;
    isBundle: boolean;
    billingCycle: BillingCycle;
    currency: Currency;
    onSuccess: () => void;
    returnUrl?: string;
}) {
    const pricing = plan.pricing?.[currency];
    const price = billingCycle === "yearly" ? (pricing?.yearly ?? 0) : (pricing?.monthly ?? 0);
    const isFree = price === 0;
    const savings = pricing ? getYearlySavings(pricing.monthly, pricing.yearly) : 0;
    const isPopular = !isBundle && (plan as SaasProduct).planTier === "pro";

    return (
        <Card className={`relative flex flex-col transition-all duration-200 ${isPopular ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20" : ""}`}>
            {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="text-xs px-3 py-0.5 shadow-sm">Most Popular</Badge>
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
                <RazorpayButton
                    saasProductId={isBundle ? undefined : Number(plan.id)}
                    bundleId={isBundle ? Number(plan.id) : undefined}
                    billingCycle={billingCycle}
                    currency={currency}
                    planName={plan.name}
                    label={isFree ? "Start Free" : "Upgrade Now"}
                    fullWidth
                    icon={!isFree ? <ArrowUpRight size={14} /> : undefined}
                    returnUrl={returnUrl}
                    onSuccess={onSuccess}
                />
            </CardFooter>
        </Card>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
    const { user } = useProfile();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get("returnUrl") ?? undefined;

    const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");
    const [currency, setCurrency] = useState<Currency>("INR");
    const [plans, setPlans] = useState<{ products: SaasProduct[]; bundles: BundlePlan[] } | null>(null);
    const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [cancelId, setCancelId] = useState<number | null>(null);
    const [canceling, setCanceling] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

    const activeSubs = subscriptions.filter(s => s.status === "active");

    const loadData = useCallback(async () => {
        setLoadingPlans(true);
        try {
            const [plansData, subsData] = await Promise.all([
                fetchPublicPlans(),
                fetchUserSubscriptions().catch(() => []),
            ]);
            setPlans(plansData);
            setSubscriptions(subsData);
        } catch {
            toast.error("Failed to load plans. Please refresh.");
        } finally {
            setLoadingPlans(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

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

    const handlePaymentSuccess = (planName: string) => {
        setPaymentSuccess(planName);
        loadData();
    };

    // Compute which plans to hide — already active or lower/equal tier in same family
    const hiddenIds = plans
        ? getHiddenProductIds(activeSubs, plans.products)
        : new Set<number>();

    const visibleProducts = plans?.products.filter(p => !hiddenIds.has(Number(p.id))) ?? [];
    // Bundles: hide if user already has an active bundle subscription for it
    const activeBundleIds = new Set(activeSubs.map(s => s.bundleId).filter(Boolean) as number[]);
    const visibleBundles = plans?.bundles.filter(b => !activeBundleIds.has(Number(b.id))) ?? [];

    const hasUpgrades = visibleProducts.length > 0 || visibleBundles.length > 0;

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
            {activeSubs.length > 0 && (
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
                        {activeSubs.map(sub => (
                            <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Zap size={14} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{sub.productName || sub.bundleName || "Plan"}</p>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {sub.billingCycle} · {sub.currency} {sub.amount ? formatPrice(sub.amount, sub.currency as Currency) : "Free"}
                                            {sub.expiresAt && ` · Renews ${new Date(sub.expiresAt).toLocaleDateString()}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="success" className="text-xs">Active</Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => setCancelId(sub.id)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Available Upgrades */}
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-semibold">
                            {activeSubs.length > 0 ? "Available Upgrades" : "Available Plans"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {activeSubs.length > 0
                                ? "Plans higher than your current subscriptions"
                                : "Choose a plan that works for your needs"}
                        </p>
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

                {loadingPlans ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={28} className="animate-spin text-muted-foreground" />
                    </div>
                ) : !hasUpgrades ? (
                    <div className="text-center py-16 text-muted-foreground border rounded-xl bg-muted/20">
                        <Crown size={36} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-semibold">You&apos;re on the highest available plan</p>
                        <p className="text-xs mt-1">No further upgrades are available at this time.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {visibleProducts.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Individual Products</h4>
                                <div className={`grid gap-4 ${visibleProducts.length === 1 ? "grid-cols-1 max-w-sm" : visibleProducts.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                                    {visibleProducts.map(product => (
                                        <PlanCard
                                            key={product.id}
                                            plan={product}
                                            isBundle={false}
                                            billingCycle={billingCycle}
                                            currency={currency}
                                            onSuccess={() => handlePaymentSuccess(product.name)}
                                            returnUrl={returnUrl}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {visibleBundles.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Bundles</h4>
                                <div className={`grid gap-4 ${visibleBundles.length === 1 ? "grid-cols-1 max-w-sm" : "grid-cols-1 sm:grid-cols-2"}`}>
                                    {visibleBundles.map(bundle => (
                                        <PlanCard
                                            key={bundle.id}
                                            plan={bundle}
                                            isBundle={true}
                                            billingCycle={billingCycle}
                                            currency={currency}
                                            onSuccess={() => handlePaymentSuccess(bundle.name)}
                                            returnUrl={returnUrl}
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
                        <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> UPI Supported</span>
                        <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Debit / Credit Cards</span>
                        <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Net Banking</span>
                        <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> International Cards</span>
                        <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> 256-bit SSL Encrypted</span>
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
