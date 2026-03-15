"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Package, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface SaaSProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  pricing: number;
  currency: string;
  subscribers: number;
  status: "active" | "beta" | "coming_soon";
  icon?: string;
}

export default function DashboardPage() {
  const [products, setProducts] = useState<SaaSProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${apiUrl}/saas-products`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await res.json();
        setProducts(data.products || data);
      } catch (err: any) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiUrl]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const activeProducts = products.filter((p) => p.status === "active");
  const betaProducts = products.filter((p) => p.status === "beta");
  const comingSoonProducts = products.filter((p) => p.status === "coming_soon");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">SaaS Products</h1>
              <p className="mt-2 text-muted-foreground">
                Explore and manage all available SaaS products and subscriptions
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/account">View Subscriptions</Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{products.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Products</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{activeProducts.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{betaProducts.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Beta</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-600">{comingSoonProducts.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Coming Soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search products by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!filterCategory ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterCategory(null)}
              >
                All Categories
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={filterCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package size={48} className="text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search" : "No products available yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
              >
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{product.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {product.category}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        product.status === "coming_soon"
                          ? "secondary"
                          : product.status === "beta"
                            ? "outline"
                            : "default"
                      }
                      className="shrink-0"
                    >
                      {product.status === "coming_soon"
                        ? "Coming Soon"
                        : product.status === "beta"
                          ? "Beta"
                          : "Active"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground flex-1">
                    {product.description}
                  </p>

                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-semibold">
                        {product.currency}
                        {product.pricing}
                        /month
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Subscribers</span>
                      <span className="font-semibold">
                        {(product.subscribers / 1000).toFixed(1)}k+
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-4"
                    disabled={product.status === "coming_soon"}
                    asChild
                  >
                    <Link href={`/dashboard/products/${product.id}`}>
                      {product.status === "coming_soon"
                        ? "Coming Soon"
                        : "View Details & Subscribe"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        {products.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Ready to manage all your subscriptions in one place?
            </p>
            <Button size="lg" asChild>
              <Link href="/account">Go to My Account</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
