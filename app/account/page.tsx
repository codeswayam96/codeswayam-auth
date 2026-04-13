"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge } from "@codeswayam/ui";
import { Separator } from "@/components/ui/separator";
import { useAccount } from "./layout";
import Link from "next/link";
import { User, CreditCard, Settings, ArrowRight, Zap, AlertCircle, Loader2, TrendingUp, Clock, ShoppingCart } from "lucide-react";
import { fetchUserSubscriptions } from "@codeswayam/api-client";

interface SaaSProduct {
  id: string;
  name: string;
  status: "active" | "inactive";
  plan?: string;
  renewalDate?: string;
}

export default function AccountPage() {
  const { user } = useAccount();
  const [products, setProducts] = useState<SaaSProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user's subscribed products using the shared API client
        const data: any = await fetchUserSubscriptions();
        const subs = data.subscriptions || data;

        // Transform subscriptions to products view
        const productsData = subs.map((sub: any) => ({
          id: sub.productId,
          name: sub.productName,
          status: sub.status === "active" ? "active" : "inactive",
          plan: sub.plan,
          renewalDate: sub.endDate,
        }));

        setProducts(productsData);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  if (!user) return null;

  const displayName = user.name || user.email.split("@")[0];
  const activeProducts = products.filter(p => p.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Zap className="text-primary" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">Welcome back, {displayName}! 👋</h2>
              <p className="text-sm text-muted-foreground">
                Manage all your SaaS subscriptions and accounts in one place
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Products</p>
                <p className="text-3xl font-bold mt-1">{activeProducts}</p>
              </div>
              <ShoppingCart size={28} className="text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Cost</p>
                <p className="text-3xl font-bold mt-1">$19</p>
              </div>
              <TrendingUp size={28} className="text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Account Status</p>
                <Badge className="mt-1 capitalize">
                  {user.status || "active"}
                </Badge>
              </div>
              <Zap size={28} className="text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="text-lg font-bold mt-1">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                    : "—"}
                </p>
              </div>
              <Clock size={28} className="text-primary/30" />
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

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile */}
        <Link href="/account/profile">
          <Card className="hover:shadow-lg transition-shadow h-full cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <User size={18} className="text-primary" />
                  Profile
                </CardTitle>
                <ArrowRight size={16} className="text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View and edit your personal information</p>
            </CardContent>
          </Card>
        </Link>

        {/* Subscriptions */}
        <Link href="/account/subscriptions">
          <Card className="hover:shadow-lg transition-shadow h-full cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard size={18} className="text-primary" />
                  Subscriptions
                </CardTitle>
                <ArrowRight size={16} className="text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage your active subscriptions and billing</p>
            </CardContent>
          </Card>
        </Link>

        {/* Security */}
        <Link href="/account/security">
          <Card className="hover:shadow-lg transition-shadow h-full cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings size={18} className="text-primary" />
                  Security
                </CardTitle>
                <ArrowRight size={16} className="text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage password, 2FA, and active sessions</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Active Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : products.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Active Subscriptions</CardTitle>
            <CardDescription>All SaaS products you&apos;re currently subscribed to</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products
                .filter(p => p.status === "active")
                .map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <div className="flex gap-2 mt-1">
                        {product.plan && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {product.plan}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Renews {product.renewalDate
                            ? new Date(product.renewalDate).toLocaleDateString()
                            : "—"
                          }
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/dashboard/products/${product.id}`}>
                        Manage
                      </a>
                    </Button>
                  </div>
                ))}
            </div>
            <Separator className="my-4" />
            <Button className="w-full" asChild>
              <Link href="/dashboard">Browse More Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingCart size={48} className="text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No active subscriptions yet</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Start exploring and subscribing to SaaS products to see them here
            </p>
            <Button className="mt-6" asChild>
              <Link href="/dashboard">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Additional Resources */}
      <Card className="bg-blue-50/30 border-blue-200/50">
        <CardHeader>
          <CardTitle className="text-base text-blue-900">💡 Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-blue-900">Browse Our Products</p>
            <p className="text-sm text-blue-800">
              Visit the dashboard to explore all available SaaS products and start subscribing
            </p>
          </div>
          <Separator className="bg-blue-200/50" />
          <div>
            <p className="text-sm font-medium text-blue-900">Secure Your Account</p>
            <p className="text-sm text-blue-800">
              Set up two-factor authentication in your security settings for better protection
            </p>
          </div>
          <Separator className="bg-blue-200/50" />
          <div>
            <p className="text-sm font-medium text-blue-900">Manage Payment Methods</p>
            <p className="text-sm text-blue-800">
              Add a payment method to be billed automatically for your subscriptions
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
