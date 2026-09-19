"use client";

import { useState, Suspense, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Zap } from "lucide-react";
import { checkUserAuth, isAllowedRedirect } from "@/lib/auth-redirect";
import { BrandLoader } from "@/components/brand-loader";
import { LoginForm } from "./_components";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function LoginPageInner() {
  const searchParams = useSearchParams();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const getRedirectUrl = useCallback(() => {
    const raw = searchParams.get("redirect") || searchParams.get("redirect_url") || "/dashboard";
    return isAllowedRedirect(raw) ? raw : "/dashboard";
  }, [searchParams]);

  useEffect(() => {
    const checkAuth = async () => {
      const timeoutPromise = new Promise<boolean>((resolve) =>
        setTimeout(() => resolve(false), 4000)
      );
      const authCheck = checkUserAuth(API_URL);
      const isAuthenticated = await Promise.race([authCheck, timeoutPromise]);

      if (isAuthenticated) {
        window.location.href = getRedirectUrl();
        return;
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [getRedirectUrl]);

  if (isCheckingAuth) {
    return <BrandLoader fullScreen size="lg" text="Verifying your credentials..." />;
  }

  const redirectUrl = getRedirectUrl();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <Link
            href="/"
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
          >
            <Zap size={24} />
          </Link>
          <CardTitle className="text-2xl">Sign in to CodeSwayam</CardTitle>
          <CardDescription>Use your account to access all tools</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm redirectUrl={redirectUrl} />
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href={`/signup${searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect")!)}` : ""}`}
              className="font-semibold text-primary hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<BrandLoader fullScreen size="lg" text="Starting secure sign-in..." />}>
      <LoginPageInner />
    </Suspense>
  );
}
