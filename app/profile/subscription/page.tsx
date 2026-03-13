"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Crown, Check, Sparkles, CreditCard, Calendar, ArrowUpRight } from "lucide-react";
import { useProfile } from "../layout";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Get started with essential features",
    features: [
      "Basic automations",
      "1 connected account",
      "100 AI responses/month",
      "Community support",
    ],
    roles: ["user", "viewer"],
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "Unlock advanced automation tools",
    features: [
      "Unlimited automations",
      "5 connected accounts",
      "Unlimited AI responses",
      "Priority support",
      "Advanced analytics",
      "Custom triggers",
    ],
    roles: ["subscriber", "editor"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$49",
    period: "/month",
    description: "For teams and power users",
    features: [
      "Everything in Pro",
      "Unlimited connected accounts",
      "Team collaboration",
      "Dedicated support",
      "Custom integrations",
      "API access",
      "White-label options",
    ],
    roles: ["admin", "superadmin"],
  },
];

export default function SubscriptionPage() {
  const { user } = useProfile();
  if (!user) return null;

  const currentPlan = plans.find((p) => p.roles.includes(user.role)) || plans[0];
  const currentPlanIndex = plans.indexOf(currentPlan);

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown size={18} className="text-primary" /> Current Plan
              </CardTitle>
              <CardDescription>Manage your subscription and billing</CardDescription>
            </div>
            <Badge variant="purple" className="text-sm px-3 py-1">
              {currentPlan.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <CreditCard size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Plan</p>
                <p className="text-sm font-medium">{currentPlan.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Sparkles size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="text-sm font-medium">{currentPlan.price}{currentPlan.period}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Calendar size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-sm font-medium">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium mb-3">Included Features</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentPlan.features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check size={14} className="text-primary shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Comparison */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, i) => {
            const isCurrent = plan === currentPlan;
            const isUpgrade = i > currentPlanIndex;
            return (
              <Card
                key={plan.name}
                className={`relative ${plan.popular ? "border-primary shadow-md" : ""} ${isCurrent ? "bg-muted/30" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="text-xs">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check size={14} className="text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      variant={isUpgrade ? "default" : "outline"}
                      className="w-full"
                      onClick={() => window.open("mailto:support@codeswayam.com?subject=Plan Change Request", "_blank")}
                    >
                      {isUpgrade ? "Upgrade" : "Downgrade"}
                      {isUpgrade && <ArrowUpRight size={14} />}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Billing Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing & Payments</CardTitle>
          <CardDescription>Payment information and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CreditCard size={32} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No payment method on file</p>
            <p className="text-xs text-muted-foreground mt-1">
              Payment integration coming soon. Contact support for billing inquiries.
            </p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <a href="mailto:support@codeswayam.com">Contact Support</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
