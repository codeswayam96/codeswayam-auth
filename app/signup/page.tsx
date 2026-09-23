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
import { Zap, ArrowLeft } from "lucide-react";
import { checkUserAuth, isAllowedRedirect } from "@/lib/auth-redirect";
import { resolveSignupSource } from "@/lib/signup-source";
import { resolveAppContext } from "@/lib/app-context";
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
  const appContext = resolveAppContext(searchParams);
  const queryStr = searchParams?.toString() || "";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      {appContext?.returnUrl && (
        <div className="w-full max-w-md mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <a
            href={appContext.returnUrl}
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors group"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to {appContext.name}
          </a>
        </div>
      )}

      <Card className="w-full max-w-md shadow-xl border-border/60">
        <CardHeader className="text-center space-y-2 pb-4">
          <Link
            href="/"
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
          >
            <Zap size={24} />
          </Link>

          {appContext ? (
            <div className="space-y-1 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-1">
                <span>{appContext.name}</span>
                <span className="text-muted-foreground/60">•</span>
                <span className="text-muted-foreground font-normal">Single Sign-On</span>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Join CodeSwayam</CardTitle>
              <CardDescription>
                Create your account to start using {appContext.name}
              </CardDescription>
            </div>
          ) : (
            <div className="space-y-1 pt-1">
              <CardTitle className="text-2xl font-bold tracking-tight">Join CodeSwayam</CardTitle>
              <CardDescription>
                One account to unlock the entire SaaS ecosystem
              </CardDescription>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <SignupForm redirectUrl={redirectUrl} signupSource={signupSource} />
        </CardContent>

        <CardFooter className="justify-center border-t border-border/40 pt-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={`/login${queryStr ? `?${queryStr}` : ""}`}
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
