"use client";

import { useState, Suspense, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { resolveSignupSource } from "@/lib/signup-source";
import { BrandLoader } from "@/components/brand-loader";
import { SignupForm } from "./_components";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function SignupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const getRedirectUrl = useCallback(() => {
    const defaultRedirect =
      process.env.NEXT_PUBLIC_DEFAULT_REDIRECT ||
      (process.env.NODE_ENV === "production"
        ? "https://www.codeswayam.com/dashboard"
        : "http://localhost:3003/dashboard");
    const raw = searchParams.get("redirect") || searchParams.get("redirect_url") || defaultRedirect;
    return isAllowedRedirect(raw) ? raw : "/dashboard";
  }, [searchParams]);

  useEffect(() => {
    const checkAuth = async () => {
      const timeoutPromise = new Promise<boolean>((resolve) =>
        setTimeout(() => resolve(false), 4000)
      );
      const isAuthenticated = await Promise.race([checkUserAuth(API_URL), timeoutPromise]);
      if (isAuthenticated) {
        window.location.href = getRedirectUrl();
        return;
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [getRedirectUrl, router]);

  if (isCheckingAuth) {
    return <BrandLoader fullScreen size="lg" text="Verifying your credentials..." />;
  }

  const redirectUrl = getRedirectUrl();
  const signupSource = resolveSignupSource(searchParams);

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
          <CardTitle className="text-2xl">Join CodeSwayam</CardTitle>
          <CardDescription>
            One account to unlock the entire SaaS ecosystem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm redirectUrl={redirectUrl} signupSource={signupSource} />
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={`/login${searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect")!)}` : ""}`}
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<BrandLoader fullScreen size="lg" text="Preparing registration..." />}>
      <SignupPageInner />
    </Suspense>
  );
}
